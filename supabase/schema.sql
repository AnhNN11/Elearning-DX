create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'admin');
create type public.assessment_type as enum ('quiz', 'code');
create type public.enrollment_status as enum ('active', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.courses (
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

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
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

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  type public.assessment_type not null,
  title text not null,
  passing_score integer not null default 70,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]',
  correct_answer jsonb not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table public.code_exercises (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  function_name text not null,
  prompt text not null,
  starter_code text not null,
  solution_notes text,
  test_cases jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.submissions (
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

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, course_id)
);

create table public.mentor_bookings (
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

create table public.mock_interview_bookings (
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

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'vi',
  title text not null,
  excerpt text,
  category text,
  tags text[] not null default '{}',
  read_time text not null default '5 phút',
  content_md text not null,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create table public.interview_questions (
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

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
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
alter table public.interview_questions enable row level security;

create policy "profiles self read" on public.profiles
for select using (auth.uid() = id or public.is_admin());
create policy "profiles self update" on public.profiles
for update using (auth.uid() = id or public.is_admin());

create policy "published courses readable" on public.courses
for select using (published = true or public.is_admin());
create policy "admin courses mutate" on public.courses
for all using (public.is_admin()) with check (public.is_admin());

create policy "published modules readable" on public.modules
for select using (
  public.is_admin() or exists (
    select 1 from public.courses where courses.id = modules.course_id and courses.published
  )
);
create policy "admin modules mutate" on public.modules
for all using (public.is_admin()) with check (public.is_admin());

create policy "published lessons readable" on public.lessons
for select using (
  public.is_admin() or exists (
    select 1
    from public.modules
    join public.courses on courses.id = modules.course_id
    where modules.id = lessons.module_id and courses.published
  )
);
create policy "admin lessons mutate" on public.lessons
for all using (public.is_admin()) with check (public.is_admin());

create policy "own enrollments" on public.enrollments
for select using (auth.uid() = user_id or public.is_admin());
create policy "own enrollments insert" on public.enrollments
for insert with check (auth.uid() = user_id or public.is_admin());
create policy "own enrollments update" on public.enrollments
for update using (auth.uid() = user_id or public.is_admin());

create policy "own lesson progress" on public.lesson_progress
for select using (auth.uid() = user_id or public.is_admin());
create policy "own lesson progress insert" on public.lesson_progress
for insert with check (auth.uid() = user_id or public.is_admin());
create policy "own lesson progress update" on public.lesson_progress
for update using (auth.uid() = user_id or public.is_admin());

create policy "published assessments readable" on public.assessments
for select using (
  public.is_admin() or exists (
    select 1 from public.courses
    where courses.id = assessments.course_id and courses.published
  )
);
create policy "admin assessments mutate" on public.assessments
for all using (public.is_admin()) with check (public.is_admin());

create policy "published questions readable" on public.questions
for select using (
  public.is_admin() or exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = questions.assessment_id and courses.published
  )
);
create policy "admin questions mutate" on public.questions
for all using (public.is_admin()) with check (public.is_admin());

create policy "published code exercises readable" on public.code_exercises
for select using (
  public.is_admin() or exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = code_exercises.assessment_id and courses.published
  )
);
create policy "admin code exercises mutate" on public.code_exercises
for all using (public.is_admin()) with check (public.is_admin());

create policy "own submissions" on public.submissions
for select using (auth.uid() = user_id or public.is_admin());
create policy "own submissions insert" on public.submissions
for insert with check (auth.uid() = user_id or public.is_admin());

create policy "own certificates" on public.certificates
for select using (auth.uid() = user_id or public.is_admin());
create policy "admin certificates mutate" on public.certificates
for all using (public.is_admin()) with check (public.is_admin());

create policy "public mentor booking insert" on public.mentor_bookings
for insert with check (true);
create policy "admin mentor booking read" on public.mentor_bookings
for select using (public.is_admin());
create policy "admin mentor booking update" on public.mentor_bookings
for update using (public.is_admin()) with check (public.is_admin());

create policy "public mock interview booking insert" on public.mock_interview_bookings
for insert with check (true);
create policy "admin mock interview booking read" on public.mock_interview_bookings
for select using (public.is_admin());
create policy "admin mock interview booking update" on public.mock_interview_bookings
for update using (public.is_admin()) with check (public.is_admin());

create policy "published blog posts readable" on public.blog_posts
for select using (published = true or public.is_admin());
create policy "admin blog posts mutate" on public.blog_posts
for all using (public.is_admin()) with check (public.is_admin());

create policy "published interview questions readable" on public.interview_questions
for select using (published = true or public.is_admin());
create policy "admin interview questions mutate" on public.interview_questions
for all using (public.is_admin()) with check (public.is_admin());
