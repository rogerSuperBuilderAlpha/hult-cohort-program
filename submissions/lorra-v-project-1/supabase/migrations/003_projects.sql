-- Mission Control v1.4 — projects entity + RLS tightening
-- Run after 001_schema.sql and 002_tasks.sql

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create type project_status as enum ('active', 'archived');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  status project_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_idx on public.projects (owner_id);
create index projects_status_idx on public.projects (status);

alter table public.tasks
  add column project_id uuid references public.projects (id) on delete set null;

create index tasks_project_idx on public.tasks (project_id);

alter table public.projects enable row level security;

create policy "projects_select_authenticated"
  on public.projects for select to authenticated using (true);

create policy "projects_insert_authenticated"
  on public.projects for insert to authenticated
  with check (owner_id = auth.uid());

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Votes: one row per (voter, recipient); upserts update in place
-- ---------------------------------------------------------------------------

-- Collapse any historical duplicate pairs (keep newest)
delete from public.votes a
using public.votes b
where a.voter_id = b.voter_id
  and a.recipient_id = b.recipient_id
  and a.created_at < b.created_at;

delete from public.votes a
using public.votes b
where a.voter_id = b.voter_id
  and a.recipient_id = b.recipient_id
  and a.created_at = b.created_at
  and a.id < b.id;

alter table public.votes
  add constraint votes_voter_recipient_unique unique (voter_id, recipient_id);

create policy "votes_update_own"
  on public.votes for update to authenticated
  using (voter_id = auth.uid())
  with check (voter_id = auth.uid() and voter_id <> recipient_id);

-- ---------------------------------------------------------------------------
-- mvp_status: only owners of at least one active project may write
-- ---------------------------------------------------------------------------

drop policy if exists "mvp_status_insert_authenticated" on public.mvp_status;
drop policy if exists "mvp_status_update_authenticated" on public.mvp_status;

create policy "mvp_status_insert_project_owners"
  on public.mvp_status for insert to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.owner_id = auth.uid() and p.status = 'active'
    )
  );

create policy "mvp_status_update_project_owners"
  on public.mvp_status for update to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.owner_id = auth.uid() and p.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.owner_id = auth.uid() and p.status = 'active'
    )
  );
