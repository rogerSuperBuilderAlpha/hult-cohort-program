-- Cohort Civilization Tracker v1 schema
-- Run in Supabase SQL editor (or via CLI) on a fresh project.

create extension if not exists "pgcrypto";

-- Enums
create type pr_status as enum ('pending', 'merged');
create type contribution_type as enum (
  'doc',
  'design',
  'pm_task',
  'issue_resolved',
  'feedback_addressed'
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  github_username text,
  created_at timestamptz not null default now()
);

-- Pull requests (self-reported)
create table public.pull_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  github_url text not null,
  title text not null,
  status pr_status not null default 'pending',
  reviewer_count int not null default 0 check (reviewer_count >= 0),
  created_at timestamptz not null default now()
);

-- Non-PR contributions
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type contribution_type not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- Peer votes (repeat votes allowed in v1; self-vote blocked in app)
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (voter_id <> recipient_id)
);

-- Single-row MVP status (any authenticated user may update)
create table public.mvp_status (
  id uuid primary key default gen_random_uuid(),
  feature_completion_pct numeric not null default 0
    check (feature_completion_pct >= 0 and feature_completion_pct <= 100),
  critical_bugs_open int not null default 0 check (critical_bugs_open >= 0),
  e2e_flow_implemented boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

-- Weekly adoption activity
create table public.weekly_activity (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  active boolean not null default false,
  unique (profile_id, week_start)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, github_username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'github_username'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.pull_requests enable row level security;
alter table public.contributions enable row level security;
alter table public.votes enable row level security;
alter table public.mvp_status enable row level security;
alter table public.weekly_activity enable row level security;

-- Authenticated members can read everything
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);
create policy "pull_requests_select_authenticated"
  on public.pull_requests for select to authenticated using (true);
create policy "contributions_select_authenticated"
  on public.contributions for select to authenticated using (true);
create policy "votes_select_authenticated"
  on public.votes for select to authenticated using (true);
create policy "mvp_status_select_authenticated"
  on public.mvp_status for select to authenticated using (true);
create policy "weekly_activity_select_authenticated"
  on public.weekly_activity for select to authenticated using (true);

-- Own-row writes for profile-tied tables
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "pull_requests_insert_own"
  on public.pull_requests for insert to authenticated
  with check (profile_id = auth.uid());
create policy "pull_requests_update_own"
  on public.pull_requests for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "pull_requests_delete_own"
  on public.pull_requests for delete to authenticated
  using (profile_id = auth.uid());

create policy "contributions_insert_own"
  on public.contributions for insert to authenticated
  with check (profile_id = auth.uid());
create policy "contributions_update_own"
  on public.contributions for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "contributions_delete_own"
  on public.contributions for delete to authenticated
  using (profile_id = auth.uid());

create policy "votes_insert_own"
  on public.votes for insert to authenticated
  with check (voter_id = auth.uid() and voter_id <> recipient_id);

create policy "weekly_activity_insert_own"
  on public.weekly_activity for insert to authenticated
  with check (profile_id = auth.uid());
create policy "weekly_activity_update_own"
  on public.weekly_activity for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- MVP status: any authenticated user can insert/update (no PM role in v1)
create policy "mvp_status_insert_authenticated"
  on public.mvp_status for insert to authenticated with check (true);
create policy "mvp_status_update_authenticated"
  on public.mvp_status for update to authenticated using (true) with check (true);

-- Seed empty MVP row (updated_by filled later by app)
insert into public.mvp_status (feature_completion_pct, critical_bugs_open, e2e_flow_implemented)
values (0, 0, false);
