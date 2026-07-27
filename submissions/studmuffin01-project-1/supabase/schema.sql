-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).

-- Creates per-user tables for INITIARA dashboard data with Row Level Security.

-- Safe to re-run: policies are dropped and recreated; tables/indexes use IF NOT EXISTS.



create table if not exists public.custom_initiatives (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users (id) on delete cascade,

  slug text not null,

  title text not null,

  deadline text not null default 'TBD',

  archived boolean not null default false,

  created_at timestamptz not null default now(),

  unique (user_id, slug)

);



create table if not exists public.user_app_data (

  user_id uuid not null references auth.users (id) on delete cascade,

  data_key text not null,

  payload jsonb not null default '{}'::jsonb,

  updated_at timestamptz not null default now(),

  primary key (user_id, data_key),

  constraint user_app_data_key_check check (

    data_key in ('initiative_tasks', 'team_members')

  )

);



alter table public.custom_initiatives enable row level security;

alter table public.user_app_data enable row level security;



drop policy if exists "Users read own custom initiatives" on public.custom_initiatives;

create policy "Users read own custom initiatives"

  on public.custom_initiatives

  for select

  using (auth.uid() = user_id);



drop policy if exists "Users insert own custom initiatives" on public.custom_initiatives;

create policy "Users insert own custom initiatives"

  on public.custom_initiatives

  for insert

  with check (auth.uid() = user_id);



drop policy if exists "Users update own custom initiatives" on public.custom_initiatives;

create policy "Users update own custom initiatives"

  on public.custom_initiatives

  for update

  using (auth.uid() = user_id)

  with check (auth.uid() = user_id);



drop policy if exists "Users delete own custom initiatives" on public.custom_initiatives;

create policy "Users delete own custom initiatives"

  on public.custom_initiatives

  for delete

  using (auth.uid() = user_id);



drop policy if exists "Users read own app data" on public.user_app_data;

create policy "Users read own app data"

  on public.user_app_data

  for select

  using (auth.uid() = user_id);



drop policy if exists "Users insert own app data" on public.user_app_data;

create policy "Users insert own app data"

  on public.user_app_data

  for insert

  with check (auth.uid() = user_id);



drop policy if exists "Users update own app data" on public.user_app_data;

create policy "Users update own app data"

  on public.user_app_data

  for update

  using (auth.uid() = user_id)

  with check (auth.uid() = user_id);



drop policy if exists "Users delete own app data" on public.user_app_data;

create policy "Users delete own app data"

  on public.user_app_data

  for delete

  using (auth.uid() = user_id);



create index if not exists custom_initiatives_user_id_idx

  on public.custom_initiatives (user_id);



create index if not exists user_app_data_user_id_idx

  on public.user_app_data (user_id);



-- Phase B migrations (safe to re-run)

alter table public.custom_initiatives

  add column if not exists archived boolean not null default false;



-- Phase C migrations (safe to re-run)

-- Retired cohort row tracking; delete orphaned rows before tightening data_key check.

delete from public.user_app_data

where data_key = 'cohort_submissions';



alter table public.user_app_data drop constraint if exists user_app_data_key_check;

alter table public.user_app_data add constraint user_app_data_key_check check (

  data_key in ('initiative_tasks', 'team_members')

);

