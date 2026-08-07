-- Run this in Supabase SQL Editor AFTER the original supabase.sql.
-- Fixes: (1) tighter RLS on projects/tasks, (2) project archive support,
-- (3) streak/total_completed can no longer be written directly by clients —
-- only via the complete_task() function below, so users can't self-report
-- fake completions.

-- --- Project archive support ---
alter table public.projects add column if not exists archived boolean not null default false;

-- --- Tighten RLS: only the creator can edit/delete a project; ---
-- --- any authenticated user can still create and view them.    ---
drop policy if exists "Authenticated users can do anything with projects" on public.projects;

create policy "Authenticated users can view all projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Only the creator can edit or delete a project"
  on public.projects for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Only the creator can delete a project"
  on public.projects for delete
  to authenticated
  using (created_by = auth.uid());

-- --- Tighten RLS: the creator or the assignee can update a task ---
-- --- (so assignees can move their own tasks through statuses),  ---
-- --- but only the creator can delete it.                        ---
drop policy if exists "Authenticated users can do anything with tasks" on public.tasks;

create policy "Authenticated users can view all tasks"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can create tasks"
  on public.tasks for insert
  to authenticated
  with check (true);

create policy "Creator or assignee can update a task"
  on public.tasks for update
  to authenticated
  using (created_by = auth.uid() or assignee_id = auth.uid())
  with check (created_by = auth.uid() or assignee_id = auth.uid());

create policy "Only the creator can delete a task"
  on public.tasks for delete
  to authenticated
  using (created_by = auth.uid());

-- --- Prevent users from writing their own streak/total_completed. ---
-- --- Only the security-definer function below can change these.  ---
revoke update (streak, total_completed, last_completed_date) on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- --- Atomic, server-side "mark task done + bump streak" ---
create or replace function public.complete_task(p_task_id uuid)
returns void as $$
declare
  v_uid uuid := auth.uid();
  v_today date := current_date;
  v_last date;
  v_streak int;
  v_total int;
  v_gap int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.tasks
  set status = 'done', completed_at = now()
  where id = p_task_id
    and (created_by = v_uid or assignee_id = v_uid);

  select last_completed_date, streak, total_completed
    into v_last, v_streak, v_total
  from public.profiles
  where id = v_uid;

  if v_last = v_today then
    update public.profiles
    set total_completed = total_completed + 1
    where id = v_uid;
    return;
  end if;

  if v_last is not null then
    v_gap := v_today - v_last;
  else
    v_gap := null;
  end if;

  update public.profiles
  set
    streak = case when v_gap = 1 then streak + 1 else 1 end,
    last_completed_date = v_today,
    total_completed = total_completed + 1
  where id = v_uid;
end;
$$ language plpgsql security definer;

grant execute on function public.complete_task(uuid) to authenticated;
