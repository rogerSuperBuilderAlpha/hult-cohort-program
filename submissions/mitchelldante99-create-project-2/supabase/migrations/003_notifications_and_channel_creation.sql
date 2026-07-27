-- Hult Hub: fix duplicate reply notifications, add notification
-- preferences, and let members create channels.
--
-- Written against the ACTUAL live schema (confirmed via information_schema
-- queries), not the schema originally assumed in 001/002. In particular:
--   * public.is_channel_member(p_channel_id uuid, p_user_id uuid) is
--     untouched here -- no DROP, no signature change, no CASCADE.
--   * There is no cohort_members table / is_cohort_member() on this
--     project, so channel creation below only checks auth.uid(), not
--     cohort membership.
--
-- This has already been applied to the live database by hand via the SQL
-- Editor. It's kept here so the migrations folder reflects what's actually
-- live. Safe to run again if needed (idempotent).

-- ---------------------------------------------------------------------------
-- 1. Fix: replying to a message used to create TWO notifications, because
--    both `on_message_notification` (-> create_message_notifications) and
--    `message_reply_notification` (-> notify_message_reply) inserted an
--    identical 'reply' notification row on every INSERT into messages.
--    We keep create_message_notifications and stop the duplicate trigger
--    from firing. Its function is left in place untouched.
-- ---------------------------------------------------------------------------
drop trigger if exists message_reply_notification on public.messages;

-- ---------------------------------------------------------------------------
-- 2. Notification preferences, wired into the real trigger functions so
--    the Settings panel's toggles do something.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists notify_on_mention boolean not null default true;

alter table public.profiles
  add column if not exists notify_on_reply boolean not null default true;

create or replace function public.create_message_notifications()
returns trigger language plpgsql security definer set search_path = 'public' as $function$
declare
  parent_author uuid;
  parent_wants_reply boolean;
begin

  -- Reply notification
  if new.parent_id is not null then

    select author_id
    into parent_author
    from public.messages
    where id = new.parent_id;

    if parent_author is not null
       and parent_author <> new.author_id then

      parent_wants_reply := null;
      select notify_on_reply into parent_wants_reply
      from public.profiles
      where id = parent_author;

      if coalesce(parent_wants_reply, true) then
        insert into public.notifications (
          user_id,
          actor_id,
          message_id,
          kind
        )
        values (
          parent_author,
          new.author_id,
          new.id,
          'reply'
        );
      end if;

    end if;

  end if;

  return new;
end;
$function$;

create or replace function public.notify_message_mentions()
returns trigger language plpgsql security definer set search_path = 'public' as $function$
declare
  mentioned_user_id uuid;
  mentioned_wants_mention boolean;
begin

  for mentioned_user_id, mentioned_wants_mention in

    select id, notify_on_mention

    from public.profiles

    where username is not null

    and new.body ilike
      '%@' || username || '%'

    and id <> new.author_id

  loop

    if coalesce(mentioned_wants_mention, true) then
      insert into public.notifications (
        user_id,
        actor_id,
        message_id,
        kind
      )

      values (
        mentioned_user_id,
        new.author_id,
        new.id,
        'mention'
      );
    end if;

  end loop;

  return new;

end;
$function$;

-- ---------------------------------------------------------------------------
-- 3. Let members create channels (public or private), and let the creator
--    join their own private channel. Does not touch is_channel_member,
--    channels_read_allowed, messages_read_allowed, or messages_insert_allowed.
-- ---------------------------------------------------------------------------
alter table public.channels
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

drop policy if exists channels_insert_own on public.channels;
create policy channels_insert_own
  on public.channels
  for insert
  to authenticated
  with check (
    created_by = auth.uid() or created_by is null
  );

drop policy if exists channel_members_join_as_creator on public.channel_members;
create policy channel_members_join_as_creator
  on public.channel_members
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.channels c
      where c.id = channel_id and c.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Helpful index for unread-notification-count queries.
-- ---------------------------------------------------------------------------
create index if not exists notifications_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- 5. Realtime: make sure notifications and channels stream live too.
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='channels') then
    alter publication supabase_realtime add table public.channels;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='message_reactions') then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;
