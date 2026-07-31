-- Fireside — Team Collaboration Platform
-- Run in Supabase SQL Editor when enabling multi-user persistence.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  handle text not null unique,
  role text not null default 'Builder',
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  primary key (workspace_id, user_id)
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind text not null check (kind in ('channel', 'dm')),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  thread_parent_id uuid references public.messages (id) on delete cascade,
  task_initiative text,
  task_label text,
  task_url text,
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_created_idx
  on public.messages (channel_id, created_at);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;

-- Bootstrap cohort workspace (idempotent)
insert into public.workspaces (slug, name)
values ('hult-fall26', 'Hult Cohort')
on conflict (slug) do nothing;
