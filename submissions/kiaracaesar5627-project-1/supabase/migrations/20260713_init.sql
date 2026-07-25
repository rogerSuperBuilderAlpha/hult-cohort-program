-- Pilot PM schema (Supabase / Postgres)

create extension if not exists "pgcrypto";

do $$ begin
  create type public.task_status as enum ('TODO', 'IN_PROGRESS', 'DONE');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  email text not null unique,
  username text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  name text not null,
  description text not null default '',
  archived boolean not null default false,
  owner_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  title text not null,
  description text not null default '',
  status public.task_status not null default 'TODO',
  due_date timestamptz,
  project_id text not null references public.projects(id) on delete cascade,
  assignee_id text references public.users(id) on delete set null,
  created_by_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);
create index if not exists tasks_status_idx on public.tasks(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- App uses the service role on the server only; no direct anon access.
revoke all on public.users from anon, authenticated;
revoke all on public.projects from anon, authenticated;
revoke all on public.tasks from anon, authenticated;
