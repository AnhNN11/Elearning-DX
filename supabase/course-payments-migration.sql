-- Add course pricing and SePay payment records to an existing DolphinX Learn database.

alter table public.courses
  add column if not exists price_vnd integer not null default 0 check (price_vnd >= 0);

alter table public.courses
  add column if not exists currency text not null default 'VND';

create table if not exists public.course_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  amount_vnd integer not null check (amount_vnd >= 0),
  currency text not null default 'VND',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  payment_content text not null,
  provider text not null default 'sepay',
  provider_payment_id text,
  bank_code text,
  bank_account text,
  bank_account_name text,
  qr_code text,
  checkout_url text,
  qr_image_url text,
  provider_transaction_id text,
  reference_number text,
  provider_raw jsonb,
  paid_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_payments add column if not exists provider text not null default 'sepay';
alter table public.course_payments add column if not exists provider_payment_id text;
alter table public.course_payments add column if not exists checkout_url text;
alter table public.course_payments add column if not exists provider_transaction_id text;
alter table public.course_payments add column if not exists provider_raw jsonb;

alter table public.course_payments enable row level security;

create index if not exists idx_course_payments_user_created_at
  on public.course_payments(user_id, created_at desc);

create index if not exists idx_course_payments_course_id
  on public.course_payments(course_id);

create index if not exists idx_course_payments_status_expires_at
  on public.course_payments(status, expires_at);

drop policy if exists "own course payments read" on public.course_payments;
create policy "own course payments read" on public.course_payments
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "own course payments insert" on public.course_payments;
drop policy if exists "own course payments update" on public.course_payments;

drop policy if exists "admin course payments mutate" on public.course_payments;
create policy "admin course payments mutate" on public.course_payments
for all using (public.is_admin()) with check (public.is_admin());
