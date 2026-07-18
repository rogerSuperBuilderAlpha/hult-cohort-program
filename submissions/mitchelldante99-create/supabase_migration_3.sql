-- Run this in Supabase SQL Editor AFTER migration_2.
-- Adds project membership (pick who's on a project) and opens up
-- task/project edit+delete to any authenticated cohort member,
-- per the team's request for a fully collaborative permission model.

-- --- Project membership ---
create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  added_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.project_members enable row level security;

create policy "Authenticated users can view project members"
  on public.project_members for select
  to authenticated
  using (true);

create policy "Authenticated users can add project members"
  on public.project_members for insert
  to authenticated
  with check (true);

create policy "Authenticated users can remove project members"
  on public.project_members for delete
  to authenticated
  using (true);

alter publication supabase_realtime add table public.project_members;

-- --- Open up project edit/delete to any authenticated cohort member ---
drop policy if exists "Only the creator can edit or delete a project" on public.projects;
drop policy if exists "Only the creator can delete a project" on public.projects;

create policy "Authenticated users can edit any project"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete any project"
  on public.projects for delete
  to authenticated
  using (true);

-- --- Open up task edit/delete to any authenticated cohort member ---
drop policy if exists "Creator or assignee can update a task" on public.tasks;
drop policy if exists "Only the creator can delete a task" on public.tasks;

create policy "Authenticated users can update any task"
  on public.tasks for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete any task"
  on public.tasks for delete
  to authenticated
  using (true);
