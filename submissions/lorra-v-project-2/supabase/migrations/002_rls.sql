-- Conexus RLS — PRD §6 (mandatory). Private channels + DMs enforced at DB layer.

-- ---------------------------------------------------------------------------
-- Helpers (security definer so policies can compose without recursion)
-- ---------------------------------------------------------------------------
create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
  );
$$;

create or replace function public.is_channel_member(p_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.channel_members cm
    where cm.channel_id = p_channel_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.can_read_channel(p_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.channels c
      where c.id = p_channel_id
        and c.is_archived = false
        and (
          c.type = 'public'
          or public.is_channel_member(c.id)
        )
    );
$$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.can_read_message(p_message_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messages m
    where m.id = p_message_id
      and (
        (m.parent_type = 'channel' and public.can_read_channel(m.parent_id))
        or (m.parent_type = 'conversation' and public.is_conversation_member(m.parent_id))
      )
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_active_user() from public;
revoke all on function public.is_channel_member(uuid) from public;
revoke all on function public.can_read_channel(uuid) from public;
revoke all on function public.is_conversation_member(uuid) from public;
revoke all on function public.can_read_message(uuid) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_channel_member(uuid) to authenticated;
grant execute on function public.can_read_channel(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_read_message(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.attachments enable row level security;
alter table public.mentions enable row level security;
alter table public.ticket_links enable row level security;
alter table public.notifications enable row level security;
alter table public.integration_configs enable row level security;
alter table public.roster_allowlist enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    public.is_active_user()
    and (status <> 'deactivated' or id = auth.uid() or public.is_admin())
  );

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert to authenticated
  with check (public.is_admin() or id = auth.uid());

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces
  for select to authenticated
  using (public.is_active_user());

drop policy if exists workspaces_admin_write on public.workspaces;
create policy workspaces_admin_write on public.workspaces
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- channels
-- ---------------------------------------------------------------------------
drop policy if exists channels_select on public.channels;
create policy channels_select on public.channels
  for select to authenticated
  using (
    public.is_active_user()
    and (
      public.is_admin()
      or type = 'public'
      or public.is_channel_member(id)
    )
  );

drop policy if exists channels_insert on public.channels;
create policy channels_insert on public.channels
  for insert to authenticated
  with check (
    public.is_active_user()
    and (
      (type = 'public' and public.is_admin())
      or (type = 'private' and created_by = auth.uid())
      or public.is_admin()
    )
  );

drop policy if exists channels_update on public.channels;
create policy channels_update on public.channels
  for update to authenticated
  using (public.is_admin() or created_by = auth.uid())
  with check (public.is_admin() or created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- channel_members
-- ---------------------------------------------------------------------------
drop policy if exists channel_members_select on public.channel_members;
create policy channel_members_select on public.channel_members
  for select to authenticated
  using (
    public.is_active_user()
    and (
      user_id = auth.uid()
      or public.is_admin()
      or public.can_read_channel(channel_id)
    )
  );

drop policy if exists channel_members_insert on public.channel_members;
create policy channel_members_insert on public.channel_members
  for insert to authenticated
  with check (
    public.is_active_user()
    and (
      public.is_admin()
      or user_id = auth.uid()
      or public.is_channel_member(channel_id)
    )
  );

drop policy if exists channel_members_update on public.channel_members;
create policy channel_members_update on public.channel_members
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists channel_members_delete on public.channel_members;
create policy channel_members_delete on public.channel_members
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- conversations + members
-- ---------------------------------------------------------------------------
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (public.is_admin() or public.is_conversation_member(id));

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (public.is_active_user());

drop policy if exists conversation_members_select on public.conversation_members;
create policy conversation_members_select on public.conversation_members
  for select to authenticated
  using (
    public.is_admin()
    or user_id = auth.uid()
    or public.is_conversation_member(conversation_id)
  );

drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_insert on public.conversation_members
  for insert to authenticated
  with check (public.is_active_user());

drop policy if exists conversation_members_update on public.conversation_members;
create policy conversation_members_update on public.conversation_members
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (
    public.is_active_user()
    and (
      (parent_type = 'channel' and public.can_read_channel(parent_id))
      or (parent_type = 'conversation' and public.is_conversation_member(parent_id))
    )
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    public.is_active_user()
    and author_id = auth.uid()
    and (
      (
        parent_type = 'channel'
        and public.is_channel_member(parent_id)
        and not exists (
          select 1 from public.channels c
          where c.id = parent_id
            and c.admin_post_only = true
            and not public.is_admin()
        )
      )
      or (parent_type = 'conversation' and public.is_conversation_member(parent_id))
    )
  );

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- soft-delete via update; hard delete admin/own
drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- reactions / attachments / mentions
-- ---------------------------------------------------------------------------
drop policy if exists reactions_select on public.reactions;
create policy reactions_select on public.reactions
  for select to authenticated
  using (public.can_read_message(message_id));

drop policy if exists reactions_write on public.reactions;
create policy reactions_write on public.reactions
  for all to authenticated
  using (user_id = auth.uid() and public.can_read_message(message_id))
  with check (user_id = auth.uid() and public.can_read_message(message_id));

drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments
  for select to authenticated
  using (public.can_read_message(message_id));

drop policy if exists attachments_insert on public.attachments;
create policy attachments_insert on public.attachments
  for insert to authenticated
  with check (public.can_read_message(message_id));

drop policy if exists mentions_select on public.mentions;
create policy mentions_select on public.mentions
  for select to authenticated
  using (
    public.can_read_message(message_id)
    or mentioned_user_id = auth.uid()
  );

drop policy if exists mentions_insert on public.mentions;
create policy mentions_insert on public.mentions
  for insert to authenticated
  with check (public.can_read_message(message_id));

-- ---------------------------------------------------------------------------
-- ticket_links
-- ---------------------------------------------------------------------------
drop policy if exists ticket_links_select on public.ticket_links;
create policy ticket_links_select on public.ticket_links
  for select to authenticated
  using (public.can_read_channel(channel_id));

drop policy if exists ticket_links_insert on public.ticket_links;
create policy ticket_links_insert on public.ticket_links
  for insert to authenticated
  with check (
    public.is_active_user()
    and created_by = auth.uid()
    and public.can_read_channel(channel_id)
  );

drop policy if exists ticket_links_update on public.ticket_links;
create policy ticket_links_update on public.ticket_links
  for update to authenticated
  using (public.is_admin() or created_by = auth.uid() or public.can_read_channel(channel_id))
  with check (public.can_read_channel(channel_id));

-- ---------------------------------------------------------------------------
-- notifications (own rows only)
-- ---------------------------------------------------------------------------
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- inserts come from service role / trusted server (no authenticated insert policy)

-- ---------------------------------------------------------------------------
-- integration_configs + roster (admin only)
-- ---------------------------------------------------------------------------
drop policy if exists integration_configs_admin on public.integration_configs;
create policy integration_configs_admin on public.integration_configs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists roster_allowlist_select on public.roster_allowlist;
create policy roster_allowlist_select on public.roster_allowlist
  for select to authenticated
  using (public.is_admin() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists roster_allowlist_admin on public.roster_allowlist;
create policy roster_allowlist_admin on public.roster_allowlist
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
