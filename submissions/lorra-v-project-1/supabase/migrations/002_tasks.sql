-- Mission Control v1.1 — tasks / deadline layer
-- Run after 001_schema.sql

create type task_status as enum ('todo', 'in_progress', 'blocked', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date date,
  status task_status not null default 'todo',
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_status_idx on public.tasks (status);
create index tasks_assignee_idx on public.tasks (assignee_id);
create index tasks_due_date_idx on public.tasks (due_date);

alter table public.tasks enable row level security;

create policy "tasks_select_authenticated"
  on public.tasks for select to authenticated using (true);

create policy "tasks_insert_authenticated"
  on public.tasks for insert to authenticated
  with check (created_by = auth.uid());

-- Assignee or creator may update (status and other fields)
create policy "tasks_update_assignee_or_creator"
  on public.tasks for update to authenticated
  using (created_by = auth.uid() or assignee_id = auth.uid())
  with check (created_by = auth.uid() or assignee_id = auth.uid());
