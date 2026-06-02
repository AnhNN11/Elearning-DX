create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.assessment_type as enum ('quiz', 'code');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enrollment_status as enum ('active', 'completed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists phone text;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

insert into public.roles (slug, name, description, is_system)
values
  ('student', 'Student', 'Learner account with course access.', true),
  ('admin', 'Admin', 'Full administrator access to the admin console.', true),
  ('mentor', 'Mentor', 'Mentor account for coaching and interview support.', true),
  ('content_manager', 'Content Manager', 'Can manage courses, blog posts, and interview content.', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system,
  updated_at = now();

insert into public.users (id, full_name, email, phone, avatar_url, created_at)
select id, full_name, email, phone, avatar_url, created_at
from public.profiles
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  avatar_url = excluded.avatar_url,
  updated_at = now();

insert into public.user_roles (user_id, role_id)
select profiles.id, roles.id
from public.profiles
join public.roles on roles.slug = profiles.role::text
on conflict (user_id, role_id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed default admin account
-- ---------------------------------------------------------------------------
-- Default credentials:
--   email: admin@dolphinx.local
--   password: Admin@123456
--
-- To override when running manually in SQL Editor, run these before this file:
--   select set_config('app.seed_admin_email', 'your-admin@example.com', false);
--   select set_config('app.seed_admin_password', 'YourStrongPassword123!', false);
--
-- This block is idempotent: it creates the auth user if missing, syncs
-- profiles/users, and guarantees a row in user_roles for the admin role.
do $$
declare
  seed_admin_email text := lower(coalesce(nullif(current_setting('app.seed_admin_email', true), ''), 'admin@dolphinx.local'));
  seed_admin_password text := coalesce(nullif(current_setting('app.seed_admin_password', true), ''), 'Admin@123456');
  seed_admin_name text := 'DolphinX Admin';
  seed_admin_id uuid;
  seed_admin_role_id uuid;
  identity_id_type text;
begin
  select id
  into seed_admin_id
  from auth.users
  where lower(email) = seed_admin_email
  limit 1;

  if seed_admin_id is null then
    seed_admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      seed_admin_id,
      'authenticated',
      'authenticated',
      seed_admin_email,
      crypt(seed_admin_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', seed_admin_name),
      now(),
      now()
    );
  else
    update auth.users
    set
      encrypted_password = crypt(seed_admin_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', seed_admin_name),
      updated_at = now()
    where id = seed_admin_id;
  end if;

  select data_type
  into identity_id_type
  from information_schema.columns
  where table_schema = 'auth'
    and table_name = 'identities'
    and column_name = 'id';

  if identity_id_type = 'uuid' then
    execute $identity$
      insert into auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        'email',
        now(),
        now(),
        now()
      )
      on conflict (provider_id, provider) do update set
        identity_data = excluded.identity_data,
        updated_at = now()
    $identity$
    using
      seed_admin_id,
      seed_admin_id::text,
      jsonb_build_object(
        'sub', seed_admin_id::text,
        'email', seed_admin_email,
        'email_verified', true,
        'phone_verified', false
      );
  else
    execute $identity$
      insert into auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        'email',
        now(),
        now(),
        now()
      )
      on conflict (provider_id, provider) do update set
        identity_data = excluded.identity_data,
        updated_at = now()
    $identity$
    using
      seed_admin_id,
      seed_admin_id::text,
      jsonb_build_object(
        'sub', seed_admin_id::text,
        'email', seed_admin_email,
        'email_verified', true,
        'phone_verified', false
      );
  end if;

  insert into public.profiles (id, full_name, email, phone, avatar_url, role)
  values (seed_admin_id, seed_admin_name, seed_admin_email, null, null, 'admin')
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    role = excluded.role;

  insert into public.users (id, full_name, email, phone, avatar_url, status)
  values (seed_admin_id, seed_admin_name, seed_admin_email, null, null, 'active')
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    status = excluded.status,
    updated_at = now();

  select id
  into seed_admin_role_id
  from public.roles
  where slug = 'admin';

  if seed_admin_role_id is null then
    raise exception 'Missing admin role seed.';
  end if;

  insert into public.user_roles (user_id, role_id, assigned_by)
  values (seed_admin_id, seed_admin_role_id, seed_admin_id)
  on conflict (user_id, role_id) do update set
    assigned_by = excluded.assigned_by;
end $$;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text not null,
  level text not null default 'Cơ bản',
  duration_hours numeric not null default 0,
  thumbnail_url text,
  accent text not null default '#075bbb',
  outcomes text[] not null default '{}',
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_assets (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('banner', 'document', 'source', 'slide', 'resource')),
  storage_bucket text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  file_size bigint,
  position integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  content_md text,
  video_url text,
  estimated_minutes integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  type public.assessment_type not null,
  title text not null,
  passing_score integer not null default 70,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]',
  correct_answer jsonb not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.code_exercises (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  function_name text not null,
  prompt text not null,
  starter_code text not null,
  solution_notes text,
  test_cases jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  score integer not null default 0,
  passed boolean not null default false,
  answers jsonb,
  code text,
  test_results jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.mentor_bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  topic text not null,
  level text not null,
  preferred_time text not null,
  note text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.mock_interview_bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  mentor_name text,
  interview_role text,
  skills text[] not null default '{}',
  topic text not null,
  level text not null,
  preferred_time text not null,
  note text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'vi',
  title text not null,
  excerpt text,
  category text,
  tags text[] not null default '{}',
  read_time text not null default '5 phút',
  author_name text,
  author_role text,
  mentor_name text,
  source_file_name text,
  cover_image_url text,
  content_md text not null,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

alter table public.blog_posts add column if not exists author_name text;
alter table public.blog_posts add column if not exists author_role text;
alter table public.blog_posts add column if not exists mentor_name text;
alter table public.blog_posts add column if not exists source_file_name text;
alter table public.blog_posts add column if not exists cover_image_url text;

create table if not exists public.landing_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  locale text not null default 'vi',
  eyebrow text,
  title text not null,
  description text,
  cta_label text,
  cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  image_url text,
  items jsonb not null default '[]',
  published boolean not null default true,
  position integer not null default 50,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, locale)
);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'vi',
  role text,
  skills text[] not null default '{}',
  category text not null,
  level text not null,
  question text not null,
  prompt_md text not null,
  answer_md text not null,
  checklist_md text not null default '',
  published boolean not null default true,
  position integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.user_has_role(role_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    join public.roles on roles.id = user_roles.role_id
    where user_roles.user_id = auth.uid() and roles.slug = role_slug
  )
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid() and profiles.role::text = role_slug
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.user_has_role('admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_role_id uuid;
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url',
    'student'
  )
  on conflict (id) do nothing;

  insert into public.users (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  select id into student_role_id from public.roles where slug = 'student';
  if student_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, student_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses enable row level security;
alter table public.course_assets enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.code_exercises enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.mentor_bookings enable row level security;
alter table public.mock_interview_bookings enable row level security;
alter table public.blog_posts enable row level security;
alter table public.landing_blocks enable row level security;
alter table public.interview_questions enable row level security;

create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_course_assets_course_id on public.course_assets(course_id);
create index if not exists idx_modules_course_id_position on public.modules(course_id, position);
create index if not exists idx_lessons_module_id_position on public.lessons(module_id, position);
create index if not exists idx_lessons_slug on public.lessons(slug);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_lesson_progress_lesson_id on public.lesson_progress(lesson_id);
create index if not exists idx_assessments_course_id_position on public.assessments(course_id, position);
create index if not exists idx_assessments_lesson_id on public.assessments(lesson_id);
create index if not exists idx_questions_assessment_id on public.questions(assessment_id);
create index if not exists idx_code_exercises_assessment_id on public.code_exercises(assessment_id);
create index if not exists idx_submissions_assessment_id on public.submissions(assessment_id);
create index if not exists idx_certificates_course_id on public.certificates(course_id);
create index if not exists idx_mock_interview_bookings_status_created_at on public.mock_interview_bookings(status, created_at desc);
create index if not exists idx_blog_posts_locale_published_at on public.blog_posts(locale, published, published_at desc);
create index if not exists idx_landing_blocks_locale_position on public.landing_blocks(locale, published, position);
create index if not exists idx_interview_questions_locale_published_position on public.interview_questions(locale, published, position);

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
for update using (auth.uid() = id or public.is_admin());

drop policy if exists "users self read" on public.users;
create policy "users self read" on public.users
for select using (auth.uid() = id or public.is_admin());
drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "roles readable" on public.roles;
create policy "roles readable" on public.roles
for select to authenticated using (true);
drop policy if exists "admin roles mutate" on public.roles;
create policy "admin roles mutate" on public.roles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "user roles self read" on public.user_roles;
create policy "user roles self read" on public.user_roles
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admin user roles mutate" on public.user_roles;
create policy "admin user roles mutate" on public.user_roles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published courses readable" on public.courses;
create policy "published courses readable" on public.courses
for select using (published = true or public.is_admin());
drop policy if exists "admin courses mutate" on public.courses;
create policy "admin courses mutate" on public.courses
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published course assets readable" on public.course_assets;
create policy "published course assets readable" on public.course_assets
for select using (
  public.is_admin() or exists (
    select 1 from public.courses
    where courses.id = course_assets.course_id and courses.published
  )
);
drop policy if exists "admin course assets mutate" on public.course_assets;
create policy "admin course assets mutate" on public.course_assets
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published modules readable" on public.modules;
create policy "published modules readable" on public.modules
for select using (
  public.is_admin() or exists (
    select 1 from public.courses where courses.id = modules.course_id and courses.published
  )
);
drop policy if exists "admin modules mutate" on public.modules;
create policy "admin modules mutate" on public.modules
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published lessons readable" on public.lessons;
create policy "published lessons readable" on public.lessons
for select using (
  public.is_admin() or exists (
    select 1
    from public.modules
    join public.courses on courses.id = modules.course_id
    where modules.id = lessons.module_id and courses.published
  )
);
drop policy if exists "admin lessons mutate" on public.lessons;
create policy "admin lessons mutate" on public.lessons
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own enrollments" on public.enrollments;
create policy "own enrollments" on public.enrollments
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "own enrollments insert" on public.enrollments;
create policy "own enrollments insert" on public.enrollments
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "own enrollments update" on public.enrollments;
create policy "own enrollments update" on public.enrollments
for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "own lesson progress" on public.lesson_progress;
create policy "own lesson progress" on public.lesson_progress
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "own lesson progress insert" on public.lesson_progress;
create policy "own lesson progress insert" on public.lesson_progress
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "own lesson progress update" on public.lesson_progress;
create policy "own lesson progress update" on public.lesson_progress
for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "published assessments readable" on public.assessments;
create policy "published assessments readable" on public.assessments
for select using (
  public.is_admin() or exists (
    select 1 from public.courses
    where courses.id = assessments.course_id and courses.published
  )
);
drop policy if exists "admin assessments mutate" on public.assessments;
create policy "admin assessments mutate" on public.assessments
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published questions readable" on public.questions;
create policy "published questions readable" on public.questions
for select using (
  public.is_admin() or exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = questions.assessment_id and courses.published
  )
);
drop policy if exists "admin questions mutate" on public.questions;
create policy "admin questions mutate" on public.questions
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published code exercises readable" on public.code_exercises;
create policy "published code exercises readable" on public.code_exercises
for select using (
  public.is_admin() or exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = code_exercises.assessment_id and courses.published
  )
);
drop policy if exists "admin code exercises mutate" on public.code_exercises;
create policy "admin code exercises mutate" on public.code_exercises
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own submissions" on public.submissions;
create policy "own submissions" on public.submissions
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "own submissions insert" on public.submissions;
create policy "own submissions insert" on public.submissions
for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "own certificates" on public.certificates;
create policy "own certificates" on public.certificates
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admin certificates mutate" on public.certificates;
create policy "admin certificates mutate" on public.certificates
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public mentor booking insert" on public.mentor_bookings;
create policy "public mentor booking insert" on public.mentor_bookings
for insert with check (true);
drop policy if exists "admin mentor booking read" on public.mentor_bookings;
create policy "admin mentor booking read" on public.mentor_bookings
for select using (public.is_admin());
drop policy if exists "admin mentor booking update" on public.mentor_bookings;
create policy "admin mentor booking update" on public.mentor_bookings
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public mock interview booking insert" on public.mock_interview_bookings;
create policy "public mock interview booking insert" on public.mock_interview_bookings
for insert with check (true);
drop policy if exists "admin mock interview booking read" on public.mock_interview_bookings;
create policy "admin mock interview booking read" on public.mock_interview_bookings
for select using (public.is_admin());
drop policy if exists "admin mock interview booking update" on public.mock_interview_bookings;
create policy "admin mock interview booking update" on public.mock_interview_bookings
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published blog posts readable" on public.blog_posts;
create policy "published blog posts readable" on public.blog_posts
for select using (published = true or public.is_admin());
drop policy if exists "admin blog posts mutate" on public.blog_posts;
create policy "admin blog posts mutate" on public.blog_posts
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published landing blocks readable" on public.landing_blocks;
create policy "published landing blocks readable" on public.landing_blocks
for select using (published = true or public.is_admin());
drop policy if exists "admin landing blocks mutate" on public.landing_blocks;
create policy "admin landing blocks mutate" on public.landing_blocks
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published interview questions readable" on public.interview_questions;
create policy "published interview questions readable" on public.interview_questions
for select using (published = true or public.is_admin());
drop policy if exists "admin interview questions mutate" on public.interview_questions;
create policy "admin interview questions mutate" on public.interview_questions
for all using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-media',
  'course-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-documents',
  'course-documents',
  true,
  52428800,
  array[
    'application/pdf',
    'text/markdown',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public course storage read" on storage.objects;
create policy "public course storage read" on storage.objects
for select using (bucket_id in ('course-media', 'course-documents'));

drop policy if exists "admin course storage insert" on storage.objects;
create policy "admin course storage insert" on storage.objects
for insert with check (bucket_id in ('course-media', 'course-documents') and public.is_admin());

drop policy if exists "admin course storage update" on storage.objects;
create policy "admin course storage update" on storage.objects
for update using (bucket_id in ('course-media', 'course-documents') and public.is_admin())
with check (bucket_id in ('course-media', 'course-documents') and public.is_admin());

drop policy if exists "admin course storage delete" on storage.objects;
create policy "admin course storage delete" on storage.objects
for delete using (bucket_id in ('course-media', 'course-documents') and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
-- Course/blog/interview seed below is independent from a specific author. The
-- default admin account is created earlier in this file and can be overridden
-- with app.seed_admin_email/app.seed_admin_password before running the schema.

insert into public.courses (
  id,
  slug,
  title,
  description,
  category,
  level,
  duration_hours,
  thumbnail_url,
  accent,
  outcomes,
  published,
  updated_at
)
values
  (
    'c1111111-1111-4111-8111-111111111111',
    'nextjs-supabase-fullstack',
    'Next.js 16 + Supabase Fullstack',
    'Xây dựng nền tảng SaaS/eLearning thực tế với App Router, Route Handlers, Supabase Auth, RLS, Storage, ORM repository layer và quy trình triển khai production.',
    'Fullstack',
    'Trung cấp',
    18,
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=85',
    '#e11d48',
    array[
      'Thiết kế database Supabase có RLS và bảng roles/users',
      'Xây API bằng Next Route Handlers thay cho mutation rải rác',
      'Upload tài liệu khóa học lên Supabase Storage',
      'Hoàn thành quiz/code assessment và cấp chứng chỉ'
    ],
    true,
    now()
  ),
  (
    'c2222222-2222-4222-8222-222222222222',
    'ai-engineering-workflow',
    'AI Engineering Workflow',
    'Học cách đưa AI vào quy trình sản phẩm: prompt design, RAG căn bản, đánh giá output, bảo mật dữ liệu và tích hợp AI vào ứng dụng web.',
    'AI',
    'Cơ bản',
    12,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85',
    '#dc2626',
    array[
      'Xây prompt có tiêu chí đánh giá rõ ràng',
      'Thiết kế workflow AI cho sản phẩm học tập',
      'Hiểu cách lưu tri thức và kiểm thử câu trả lời AI',
      'Biết các rủi ro bảo mật khi tích hợp AI'
    ],
    true,
    now()
  ),
  (
    'c3333333-3333-4333-8333-333333333333',
    'cloud-devops-foundation',
    'Cloud & DevOps Foundation',
    'Nền tảng cloud cho lập trình viên: Docker, CI/CD, biến môi trường, logging, deployment checklist và cách vận hành hệ thống học trực tuyến.',
    'DevOps',
    'Cơ bản',
    10,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    '#b91c1c',
    array[
      'Đóng gói ứng dụng bằng Docker',
      'Tạo pipeline kiểm thử và build',
      'Quản lý secret/env an toàn',
      'Theo dõi log, lỗi và hiệu năng sau deploy'
    ],
    true,
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  duration_hours = excluded.duration_hours,
  thumbnail_url = excluded.thumbnail_url,
  accent = excluded.accent,
  outcomes = excluded.outcomes,
  published = excluded.published,
  updated_at = now();

insert into public.course_assets (
  id,
  course_id,
  title,
  kind,
  storage_bucket,
  storage_path,
  public_url,
  mime_type,
  file_size,
  position
)
values
  (
    'a1111111-1111-4111-8111-111111111111',
    (select id from public.courses where slug = 'nextjs-supabase-fullstack'),
    'Banner Next.js Supabase Fullstack',
    'banner',
    'course-media',
    'seed/nextjs-supabase-fullstack/banner.jpg',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=85',
    'image/jpeg',
    0,
    0
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    (select id from public.courses where slug = 'ai-engineering-workflow'),
    'Banner AI Engineering Workflow',
    'banner',
    'course-media',
    'seed/ai-engineering-workflow/banner.jpg',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=85',
    'image/jpeg',
    0,
    0
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    (select id from public.courses where slug = 'cloud-devops-foundation'),
    'Banner Cloud DevOps Foundation',
    'banner',
    'course-media',
    'seed/cloud-devops-foundation/banner.jpg',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    'image/jpeg',
    0,
    0
  )
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  kind = excluded.kind,
  storage_bucket = excluded.storage_bucket,
  storage_path = excluded.storage_path,
  public_url = excluded.public_url,
  mime_type = excluded.mime_type,
  file_size = excluded.file_size,
  position = excluded.position;

insert into public.modules (id, course_id, title, position)
values
  ('11111111-aaaa-4aaa-8aaa-111111111111', (select id from public.courses where slug = 'nextjs-supabase-fullstack'), 'Nền tảng dự án', 1),
  ('11111111-bbbb-4bbb-8bbb-111111111111', (select id from public.courses where slug = 'nextjs-supabase-fullstack'), 'Data layer và đánh giá', 2),
  ('22222222-aaaa-4aaa-8aaa-222222222222', (select id from public.courses where slug = 'ai-engineering-workflow'), 'Thiết kế workflow AI', 1),
  ('22222222-bbbb-4bbb-8bbb-222222222222', (select id from public.courses where slug = 'ai-engineering-workflow'), 'Đánh giá và vận hành AI', 2),
  ('33333333-aaaa-4aaa-8aaa-333333333333', (select id from public.courses where slug = 'cloud-devops-foundation'), 'Đóng gói và triển khai', 1),
  ('33333333-bbbb-4bbb-8bbb-333333333333', (select id from public.courses where slug = 'cloud-devops-foundation'), 'Vận hành production', 2)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  position = excluded.position;

insert into public.lessons (
  id,
  module_id,
  slug,
  title,
  content_md,
  video_url,
  estimated_minutes,
  position
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-aaaa-4aaa-8aaa-111111111111',
    'kien-truc-nextjs-supabase',
    'Kiến trúc Next.js + Supabase cho eLearning',
    $md$
# Kiến trúc tổng quan

Một nền tảng eLearning production nên tách rõ bốn lớp:

- **UI**: page, component, form và trạng thái người dùng.
- **API**: Next Route Handlers xử lý mutation và trả JSON.
- **ORM/repository**: nơi tập trung query Supabase, mapping row sang domain model.
- **Database/Auth/Storage**: Supabase Postgres, Auth, RLS và Storage bucket.

## Luồng đăng ký học

1. User bấm đăng ký khóa học.
2. Server Action forward `FormData` sang `/api/enrollments`.
3. API kiểm tra session Supabase.
4. Repository ghi `enrollments` theo khóa `user_id, course_id`.
5. UI revalidate trang học.

## Checklist triển khai

- Tất cả mutation phải đi qua API.
- Table có RLS trước khi public app.
- Không lưu secret trong client component.
- Storage upload phải lưu metadata vào `course_assets`.
$md$,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    18,
    1
  ),
  (
    '11111111-2222-4222-8222-111111111111',
    '11111111-aaaa-4aaa-8aaa-111111111111',
    'supabase-rls-roles',
    'Supabase Auth, RLS và roles',
    $md$
# Supabase Auth và RLS

RLS giúp database tự bảo vệ dữ liệu theo session hiện tại. Với hệ thống học trực tuyến, tối thiểu nên có:

- `profiles`: hồ sơ user.
- `users`: bảng app-level để admin quản lý.
- `roles`: danh sách quyền.
- `user_roles`: bảng gán nhiều quyền cho một user.

## Policy mẫu

```sql
create policy "own enrollments"
on public.enrollments
for select
using (auth.uid() = user_id or public.is_admin());
```

## Khi nào dùng service role?

Chỉ dùng ở script server-side đáng tin cậy như tạo admin ban đầu. Không đưa service role key vào browser.
$md$,
    null,
    20,
    2
  ),
  (
    '11111111-3333-4333-8333-111111111111',
    '11111111-bbbb-4bbb-8bbb-111111111111',
    'orm-repository-layer',
    'Tách ORM/repository layer',
    $md$
# Repository layer

Repository là nơi duy nhất được phép gọi `.from("table")`. Page, component và API chỉ gọi method nghiệp vụ:

```ts
const orm = await requireApiOrm();
await orm.learning.enroll(profile.id, courseId);
```

## Lợi ích

- Query được quản lý tập trung.
- Dễ đổi schema hơn.
- API route ngắn và dễ test.
- Domain model dùng `camelCase`, database giữ `snake_case`.
$md$,
    null,
    16,
    1
  ),
  (
    '11111111-4444-4444-8444-111111111111',
    '11111111-bbbb-4bbb-8bbb-111111111111',
    'kiem-tra-va-cap-chung-chi',
    'Kiểm tra kết quả và cấp chứng chỉ',
    $md$
# Assessment và certificate

Một bài học có thể gắn `assessment` dạng quiz hoặc code. Khi user hoàn thành toàn bộ lesson:

1. Tính số lesson đã hoàn thành.
2. Cập nhật `enrollments.progress_percent`.
3. Nếu đạt 100%, upsert `certificates` theo `user_id, course_id`.

Certificate nên có mã riêng để verify công khai, ví dụ `TECH-2026-AB12CD34`.
$md$,
    null,
    14,
    2
  ),
  (
    '22222222-1111-4111-8111-222222222222',
    '22222222-aaaa-4aaa-8aaa-222222222222',
    'prompt-design-co-tieu-chi',
    'Prompt design có tiêu chí đánh giá',
    $md$
# Prompt design

Prompt tốt không chỉ mô tả nhiệm vụ. Nó cần có:

- Vai trò của model.
- Ngữ cảnh dữ liệu.
- Định dạng output.
- Tiêu chí đúng/sai.
- Ví dụ biên.

## Mẫu prompt

```md
Bạn là mentor phỏng vấn frontend.
Hãy tạo 5 câu hỏi React ở trình độ junior.
Mỗi câu gồm: câu hỏi, gợi ý, đáp án chuẩn và checklist chấm điểm.
```
$md$,
    null,
    15,
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-bbbb-4bbb-8bbb-222222222222',
    'rag-va-danh-gia-output',
    'RAG và đánh giá output AI',
    $md$
# RAG căn bản

RAG giúp model trả lời dựa trên tài liệu của hệ thống. Một pipeline tối thiểu gồm:

1. Tách tài liệu thành chunk.
2. Tạo embedding.
3. Lưu vector và metadata.
4. Truy vấn theo câu hỏi.
5. Đưa context vào prompt.

## Đánh giá output

Luôn kiểm tra hallucination, nguồn trích dẫn, tính đầy đủ và khả năng tái lập.
$md$,
    null,
    18,
    1
  ),
  (
    '33333333-1111-4111-8111-333333333333',
    '33333333-aaaa-4aaa-8aaa-333333333333',
    'docker-env-ci',
    'Docker, biến môi trường và CI',
    $md$
# Docker và CI

Ứng dụng Next.js cần quy trình build nhất quán:

- Cài dependency bằng lockfile.
- Chạy lint và build trước deploy.
- Không bake secret vào image.
- Dùng environment variable theo môi trường.

## Pipeline gợi ý

```yaml
steps:
  - npm ci
  - npm run lint
  - npm run build
```
$md$,
    null,
    17,
    1
  ),
  (
    '33333333-2222-4222-8222-333333333333',
    '33333333-bbbb-4bbb-8bbb-333333333333',
    'logging-monitoring-checklist',
    'Logging, monitoring và checklist production',
    $md$
# Vận hành production

Sau khi deploy cần theo dõi:

- Lỗi API theo endpoint.
- Thời gian phản hồi.
- Tỉ lệ upload thất bại.
- Trạng thái job tạo chứng chỉ.
- Số lượng booking mentor mới.

## Checklist trước release

- Database migration đã chạy.
- RLS policy đã kiểm tra.
- Admin account có role `admin`.
- Storage bucket upload được file thật.
$md$,
    null,
    16,
    1
  )
on conflict (id) do update set
  module_id = excluded.module_id,
  slug = excluded.slug,
  title = excluded.title,
  content_md = excluded.content_md,
  video_url = excluded.video_url,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position;

insert into public.assessments (
  id,
  course_id,
  lesson_id,
  type,
  title,
  passing_score,
  position
)
values
  (
    'e1111111-1111-4111-8111-111111111111',
    (select id from public.courses where slug = 'nextjs-supabase-fullstack'),
    '11111111-2222-4222-8222-111111111111',
    'quiz',
    'Quiz: Supabase RLS và roles',
    70,
    1
  ),
  (
    'e1111111-2222-4222-8222-111111111111',
    (select id from public.courses where slug = 'nextjs-supabase-fullstack'),
    '11111111-3333-4333-8333-111111111111',
    'code',
    'Code: Chuẩn hóa role slug',
    100,
    1
  ),
  (
    'e2222222-1111-4111-8111-222222222222',
    (select id from public.courses where slug = 'ai-engineering-workflow'),
    '22222222-1111-4111-8111-222222222222',
    'quiz',
    'Quiz: Prompt design',
    70,
    1
  ),
  (
    'e3333333-1111-4111-8111-333333333333',
    (select id from public.courses where slug = 'cloud-devops-foundation'),
    '33333333-1111-4111-8111-333333333333',
    'quiz',
    'Quiz: CI/CD căn bản',
    70,
    1
  )
on conflict (id) do update set
  course_id = excluded.course_id,
  lesson_id = excluded.lesson_id,
  type = excluded.type,
  title = excluded.title,
  passing_score = excluded.passing_score,
  position = excluded.position;

insert into public.questions (
  id,
  assessment_id,
  prompt,
  options,
  correct_answer,
  explanation
)
values
  (
    'f1111111-1111-4111-8111-111111111111',
    'e1111111-1111-4111-8111-111111111111',
    'RLS trong Supabase giúp giải quyết vấn đề gì?',
    jsonb_build_array('Tự động tạo UI component', 'Kiểm soát quyền đọc/ghi dữ liệu ở database', 'Tăng tốc ảnh trong Storage', 'Biên dịch TypeScript nhanh hơn'),
    jsonb_build_object('correctIndex', 1),
    'RLS chạy ở database nên vẫn bảo vệ dữ liệu ngay cả khi API có lỗi logic.'
  ),
  (
    'f1111111-2222-4222-8222-111111111111',
    'e1111111-1111-4111-8111-111111111111',
    'Bảng nào phù hợp để gán nhiều quyền cho một user?',
    jsonb_build_array('courses', 'user_roles', 'lesson_progress', 'questions'),
    jsonb_build_object('correctIndex', 1),
    'Bảng nối user_roles cho phép một user có nhiều role như admin, mentor hoặc content_manager.'
  ),
  (
    'f2222222-1111-4111-8111-222222222222',
    'e2222222-1111-4111-8111-222222222222',
    'Một prompt production nên có phần nào quan trọng nhất để dễ đánh giá?',
    jsonb_build_array('Màu sắc giao diện', 'Tiêu chí output đúng/sai', 'Tên framework frontend', 'Số lượng file trong project'),
    jsonb_build_object('correctIndex', 1),
    'Tiêu chí output giúp kiểm thử và so sánh chất lượng phản hồi giữa các phiên bản.'
  ),
  (
    'f3333333-1111-4111-8111-333333333333',
    'e3333333-1111-4111-8111-333333333333',
    'Secret production nên được quản lý như thế nào?',
    jsonb_build_array('Commit trực tiếp vào Git', 'Lưu trong biến môi trường/secret manager', 'Đặt trong component client', 'Gửi qua query string'),
    jsonb_build_object('correctIndex', 1),
    'Secret phải nằm ở môi trường server hoặc secret manager, không đưa vào client bundle.'
  )
on conflict (id) do update set
  assessment_id = excluded.assessment_id,
  prompt = excluded.prompt,
  options = excluded.options,
  correct_answer = excluded.correct_answer,
  explanation = excluded.explanation;

insert into public.code_exercises (
  id,
  assessment_id,
  function_name,
  prompt,
  starter_code,
  solution_notes,
  test_cases
)
values
  (
    'd1111111-1111-4111-8111-111111111111',
    'e1111111-2222-4222-8222-111111111111',
    'normalizeRoleSlug',
    'Viết hàm normalizeRoleSlug(input) để chuyển tên role thành slug chữ thường, bỏ dấu cách thừa và thay nhóm ký tự không hợp lệ bằng dấu gạch dưới.',
    $code$function normalizeRoleSlug(input) {
  // TODO: return a slug like "content_manager"
}
$code$,
    'Có thể dùng trim, toLowerCase và replace với regex /[^a-z0-9]+/g.',
    jsonb_build_array(
      jsonb_build_object('name', 'admin role', 'args', jsonb_build_array(' Admin '), 'expected', 'admin'),
      jsonb_build_object('name', 'content manager', 'args', jsonb_build_array('Content Manager'), 'expected', 'content_manager'),
      jsonb_build_object('name', 'mentor lead', 'args', jsonb_build_array('mentor---lead'), 'expected', 'mentor_lead')
    )
  )
on conflict (id) do update set
  assessment_id = excluded.assessment_id,
  function_name = excluded.function_name,
  prompt = excluded.prompt,
  starter_code = excluded.starter_code,
  solution_notes = excluded.solution_notes,
  test_cases = excluded.test_cases;

insert into public.blog_posts (
  id,
  slug,
  locale,
  title,
  excerpt,
  category,
  tags,
  read_time,
  content_md,
  published,
  published_at,
  updated_at
)
values
  (
    'b1111111-1111-4111-8111-111111111111',
    'tach-api-va-orm-trong-nextjs',
    'vi',
    'Tách Next API và ORM trong dự án eLearning',
    'Cách tổ chức mutation qua Route Handlers và gom Supabase query vào repository layer để dễ bảo trì.',
    'Architecture',
    array['Next.js', 'Supabase', 'ORM'],
    '7 phút',
    $md$
# Tách API và ORM trong Next.js

Khi ứng dụng bắt đầu có admin, course upload, booking, blog và chứng chỉ, query rải rác sẽ rất khó kiểm soát.

Kiến trúc gợi ý:

1. Server Action chỉ forward form và revalidate.
2. Route Handler kiểm tra auth, parse input và gọi repository.
3. Repository gọi Supabase và map row.
4. Component chỉ nhận domain model.

Lợi ích lớn nhất là khi đổi schema, bạn sửa một nơi thay vì lục toàn bộ UI.
$md$,
    true,
    now() - interval '5 days',
    now()
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    'hoc-fullstack-can-biet-gi-ve-rls',
    'vi',
    'Học fullstack cần biết gì về Supabase RLS?',
    'RLS không chỉ là security nâng cao, mà là lớp bảo vệ bắt buộc khi dữ liệu user nằm trong Postgres.',
    'Security',
    array['RLS', 'Auth', 'Postgres'],
    '6 phút',
    $md$
# Supabase RLS cho fullstack developer

RLS là cơ chế để mỗi query tự kiểm tra quyền theo `auth.uid()`. Với eLearning, RLS giúp:

- User chỉ thấy enrollment của chính mình.
- Admin thấy dashboard và quản lý nội dung.
- Public chỉ đọc course/blog đã publish.

Sai lầm thường gặp là chỉ kiểm tra quyền ở UI. UI có thể bị bỏ qua, còn database policy thì không.
$md$,
    true,
    now() - interval '3 days',
    now()
  ),
  (
    'b3333333-3333-4333-8333-333333333333',
    'interview-prep-with-markdown',
    'en',
    'Build an Interview Prep Bank with Markdown',
    'A practical structure for storing role-based interview prompts, answers, and scoring checklists as Markdown.',
    'Interview',
    array['Interview', 'Markdown', 'Learning'],
    '5 min',
    $md$
# Interview prep with Markdown

Markdown is a good storage format for interview preparation because it stays readable in the admin panel and renders cleanly for learners.

Recommended fields:

- role and seniority level
- required skills
- question
- answer
- scoring checklist

This keeps the question bank searchable without locking content authors into custom UI blocks.
$md$,
    true,
    now() - interval '1 day',
    now()
  )
on conflict (slug, locale) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  tags = excluded.tags,
  read_time = excluded.read_time,
  content_md = excluded.content_md,
  published = excluded.published,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.interview_questions (
  id,
  locale,
  role,
  skills,
  category,
  level,
  question,
  prompt_md,
  answer_md,
  checklist_md,
  published,
  position,
  updated_at
)
values
  (
    '90000001-1111-4111-8111-111111111111',
    'vi',
    'Frontend Developer',
    array['React', 'Next.js', 'State management'],
    'Frontend',
    'Junior',
    'Khi nào nên dùng Server Component và khi nào nên dùng Client Component trong Next.js?',
    $md$
Giải thích dựa trên dữ liệu cần render, tương tác người dùng và ranh giới server/client.
$md$,
    $md$
Server Component phù hợp khi phần UI chỉ cần render dữ liệu từ server, không cần state trình duyệt hoặc event handler. Client Component dùng khi cần `useState`, `useEffect`, browser API, form tương tác hoặc thư viện chỉ chạy trên client.

Trong Next.js, nên giữ component server mặc định để giảm JavaScript gửi xuống client, chỉ đánh dấu `"use client"` tại ranh giới thật sự cần tương tác.
$md$,
    $md$
- Nêu được mặc định là Server Component.
- Biết Client Component cần cho state/event/browser API.
- Hiểu tác động tới bundle size.
- Có ví dụ thực tế như login form hoặc code runner.
$md$,
    true,
    1,
    now()
  ),
  (
    '90000002-2222-4222-8222-222222222222',
    'vi',
    'Backend Developer',
    array['Postgres', 'RLS', 'API design'],
    'Backend',
    'Middle',
    'Thiết kế API enrollment cho user đăng ký khóa học như thế nào để an toàn?',
    $md$
Trình bày endpoint, kiểm tra auth, kiểm tra dữ liệu đầu vào và database constraint.
$md$,
    $md$
Endpoint nên là `POST /api/enrollments`, lấy user từ session Supabase thay vì tin vào `userId` từ client. Input chỉ cần `courseId`. Database có unique constraint `user_id, course_id` và RLS cho phép user insert enrollment của chính họ.

Nên dùng upsert để idempotent, trả kết quả rõ ràng và revalidate trang học sau khi thành công.
$md$,
    $md$
- Không nhận userId từ client.
- Có session/auth check.
- Có unique constraint hoặc upsert.
- Có RLS/policy tương ứng.
- Biết xử lý lỗi course không tồn tại.
$md$,
    true,
    2,
    now()
  ),
  (
    '90000003-3333-4333-8333-333333333333',
    'vi',
    'Fullstack Developer',
    array['Next.js', 'Supabase', 'Storage'],
    'System Design',
    'Senior',
    'Thiết kế upload tài liệu khóa học bằng Supabase Storage và lưu metadata ra sao?',
    $md$
Ứng viên cần mô tả bucket, policy, upload flow và bảng metadata.
$md$,
    $md$
Tạo bucket public hoặc signed URL tùy yêu cầu. Admin upload file qua API route, API kiểm tra quyền admin, upload bytes vào bucket, lấy public URL rồi insert metadata vào `course_assets`: `course_id`, `kind`, `storage_bucket`, `storage_path`, `public_url`, `mime_type`, `file_size`.

Course detail chỉ đọc metadata từ database, không scan bucket trực tiếp.
$md$,
    $md$
- Có bucket và MIME/file size limit.
- Có admin policy cho insert/update/delete.
- Lưu metadata vào bảng riêng.
- Không để client tự quyết định quyền upload.
- Biết khác biệt public URL và signed URL.
$md$,
    true,
    3,
    now()
  ),
  (
    '90000004-4444-4444-8444-444444444444',
    'en',
    'AI Engineer',
    array['Prompt engineering', 'Evaluation', 'RAG'],
    'AI',
    'Middle',
    'How would you evaluate an AI answer in a production learning platform?',
    $md$
Cover correctness, groundedness, safety, and reproducibility.
$md$,
    $md$
I would define a rubric before testing: factual correctness, use of provided context, completeness, tone, refusal behavior, and citation quality where applicable. For RAG, I would also log retrieved chunks and compare the answer against source documents.

Automated checks can catch format and policy issues, but human review is still needed for nuanced educational quality.
$md$,
    $md$
- Mentions a rubric.
- Checks groundedness against retrieved context.
- Separates automated checks from human review.
- Considers safety/privacy.
- Talks about regression testing across prompt versions.
$md$,
    true,
    4,
    now()
  )
on conflict (id) do update set
  locale = excluded.locale,
  role = excluded.role,
  skills = excluded.skills,
  category = excluded.category,
  level = excluded.level,
  question = excluded.question,
  prompt_md = excluded.prompt_md,
  answer_md = excluded.answer_md,
  checklist_md = excluded.checklist_md,
  published = excluded.published,
  position = excluded.position,
  updated_at = now();

insert into public.mock_interview_bookings (
  id,
  full_name,
  email,
  mentor_name,
  interview_role,
  skills,
  topic,
  level,
  preferred_time,
  note,
  status,
  created_at
)
values
  (
    '70000001-1111-4111-8111-111111111111',
    'Nguyen Anh Demo',
    'anh.demo@example.com',
    'Anh Minh',
    'Frontend Developer',
    array['React', 'Next.js', 'TypeScript'],
    'Mock interview Frontend Junior',
    'Junior',
    'Thứ 3, 19:30',
    'Muốn luyện giải thích Server Component và state management.',
    'new',
    now() - interval '2 days'
  ),
  (
    '70000002-2222-4222-8222-222222222222',
    'Tran Linh Demo',
    'linh.demo@example.com',
    'Chị Linh',
    'AI Product Engineer',
    array['Prompt', 'RAG', 'Evaluation'],
    'Mock interview AI workflow',
    'Middle',
    'Thứ 7, 09:00',
    'Cần review portfolio AI workflow trước khi phỏng vấn.',
    'contacted',
    now() - interval '1 day'
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  mentor_name = excluded.mentor_name,
  interview_role = excluded.interview_role,
  skills = excluded.skills,
  topic = excluded.topic,
  level = excluded.level,
  preferred_time = excluded.preferred_time,
  note = excluded.note,
  status = excluded.status;
