-- Cohart Hub: permissions for editing/deleting your own messages.
-- Safe follow-up migration: does not drop or replace is_channel_member().
-- Run after your existing working Cohart Hub schema/policies.

alter table if exists public.messages enable row level security;

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own
on public.messages
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own
on public.messages
for delete
to authenticated
using (auth.uid() = author_id);
