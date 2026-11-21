-- Foodle Noodle — KPI & Empathy App: Supabase schema
-- Project: foodle-kpi-empathy (ap-southeast-1)
-- Reads: any signed-in user whose email is in app_users.
-- Writes: only through the RPC functions below (security definer), which enforce roles
-- and segregation of duties (a submitter cannot approve their own KPI; a recorder cannot confirm their own help log).

create table public.app_users (
  email text primary key,
  display_name text not null,
  role text not null default 'viewer' check (role in ('viewer','editor','hr','admin')),
  dept text,
  created_at timestamptz not null default now()
);
create table public.kpi_master (
  kpi_id text primary key, dept text not null, kpi text not null, target text, weight numeric, sort int not null default 0
);
create table public.kpi_scores (
  id bigint generated always as identity primary key,
  year int not null default 2026,
  month_no int not null check (month_no between 1 and 12),
  kpi_id text not null references public.kpi_master(kpi_id),
  score numeric check (score is null or (score >= 0 and score <= 5)),
  status text not null check (status in ('ได้คะแนน','N/A','ไม่มีรายงาน','รอข้อมูล')),
  note text,
  state text not null default 'รอ HR ตรวจ' check (state in ('รอ HR ตรวจ','อนุมัติ','ส่งกลับ')),
  source text not null default 'app' check (source in ('file','app')),
  submitted_by uuid, submitted_name text, submitted_at timestamptz not null default now(),
  reviewed_by uuid, reviewed_name text, reviewed_at timestamptz, review_note text,
  unique (year, month_no, kpi_id)
);
create table public.sales_monthly (
  year int not null, month_no int not null check (month_no between 1 and 12),
  actual_baht numeric, target_baht numeric not null default 3750000,
  primary key (year, month_no)
);
create table public.kpi_audit (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(), action text not null,
  year int, month_no int, kpi_id text, score numeric, status text,
  by_uid uuid, by_name text, note text
);
create table public.help_log (
  id bigint generated always as identity primary key,
  date date not null, helper text not null, helper_dept text, receiver text not null, receiver_dept text,
  help_type text not null check (help_type in ('ช่วยงานในแผนก','ช่วยงานข้ามแผนก','ช่วยแก้ปัญหาด่วน/คุณภาพ/ความปลอดภัย')),
  detail text not null,
  status text not null default 'รอยืนยัน' check (status in ('รอยืนยัน','ยืนยัน','ไม่อนุมัติ')),
  source text not null default 'app',
  recorded_by uuid, recorded_name text, recorded_at timestamptz not null default now(),
  confirmed_by uuid, confirmed_name text, confirmed_at timestamptz
);
create index on public.kpi_scores (year, month_no);
create index on public.help_log (date);
create index on public.kpi_audit (at desc);

create or replace function public.app_role() returns text language sql stable security definer set search_path = public as $$
  select role from public.app_users where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;
create or replace function public.app_name() returns text language sql stable security definer set search_path = public as $$
  select display_name from public.app_users where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

alter table public.app_users enable row level security;
alter table public.kpi_master enable row level security;
alter table public.kpi_scores enable row level security;
alter table public.sales_monthly enable row level security;
alter table public.kpi_audit enable row level security;
alter table public.help_log enable row level security;
create policy "members read" on public.app_users for select to authenticated using (public.app_role() is not null);
create policy "members read" on public.kpi_master for select to authenticated using (public.app_role() is not null);
create policy "members read" on public.kpi_scores for select to authenticated using (public.app_role() is not null);
create policy "members read" on public.sales_monthly for select to authenticated using (public.app_role() is not null);
create policy "members read" on public.kpi_audit for select to authenticated using (public.app_role() is not null);
create policy "members read" on public.help_log for select to authenticated using (public.app_role() is not null);

create or replace function public.whoami() returns json language sql stable security definer set search_path = public as $$
  select json_build_object('email', auth.jwt() ->> 'email', 'role', public.app_role(), 'name', public.app_name())
$$;

-- submit_kpi(p_year, p_month, p_items jsonb[{kpi_id, score, status, note}]) : editor/hr/admin
-- review_kpi(p_id, p_state 'อนุมัติ'|'ส่งกลับ', p_note) : hr/admin, not own submission
-- add_help / confirm_help / delete_help : editor/hr/admin, recorder cannot confirm own
-- admin_set_user / admin_remove_user : admin
-- (Full function bodies are in the Supabase project; see migration "kpi_empathy_schema".)
