-- Step 6: thread subscriptions (PRD §4.3)
-- Subscribers = root author + repliers + @mentioned (maintained in app code).
-- last_read_at drives unread unread unread unread unread unread unread unread unread unread unread unread unread unread unreadunread state in the Threads view.

create table if not exists public.thread_subscriptions (
  thread_root_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (thread_root_id, user_id)
);

create index if not exists thread_subscriptions_user_idx
  on public.thread_subscriptions (user_id);

alter table public.thread_subscriptions enable row level security;

drop policy if exists thread_subscriptions_select on public.thread_subscriptions;
create policy thread_subscriptions_select on public.thread_subscriptions
  for select to authenticated
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists thread_subscriptions_insert on public.thread_subscriptions;
create policy thread_subscriptions_insert on public.thread_subscriptions
  for insert to authenticated
  with check (
    public.is_active_user()
    and user_id = auth.uid()
    and public.can_read_message(thread_root_id)
  );

drop policy if exists thread_subscriptions_update on public.thread_subscriptions;
create policy thread_subscriptions_update on public.thread_subscriptions
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists thread_subscriptions_delete on public.thread_subscriptions;
create policy thread_subscriptions_delete on public.thread_subscriptions
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
