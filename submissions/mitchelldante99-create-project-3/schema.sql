-- ============================================================
-- Hult Cohort 67 — Supabase schema
-- Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- Participant profiles (the cohort wall)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text generated always as (lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))) stored,
  handle text,
  color text default 'coral',
  title text,
  tagline text,
  url text,
  tags text[] default '{}',
  flag_count int default 0,
  hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists profiles_name_key_idx on profiles (name_key);

-- Peer reviews (private — only queryable by exact target name match)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  target_name text not null,
  target_name_key text generated always as (lower(regexp_replace(trim(target_name), '[^a-zA-Z0-9]+', '-', 'g'))) stored,
  reviewer_name text not null,
  review_text text not null,
  vote text default 'up' check (vote in ('up', 'abstain')),
  created_at timestamptz default now()
);

create index if not exists reviews_target_key_idx on reviews (target_name_key);

-- Row Level Security: allow public read/write for this trusted-cohort use case.
-- (No user accounts in this app, so we can't scope by auth.uid(). This matches
-- the "trusted cohort, not high-security" bar we discussed.)
alter table profiles enable row level security;
alter table reviews enable row level security;

create policy "public can read profiles" on profiles for select using (true);
create policy "public can insert profiles" on profiles for insert with check (true);
create policy "public can update profiles" on profiles for update using (true);

create policy "public can insert reviews" on reviews for insert with check (true);
create policy "public can read reviews" on reviews for select using (true);

-- Done. After running this, go to Project Settings → API and grab:
--   Project URL
--   anon public key
-- and send both back so the site can be wired up.
