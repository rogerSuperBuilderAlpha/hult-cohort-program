-- OPTIONAL migration -- read the explanation before running this one.
-- NOT YET APPLIED to the live database as of this writing.
--
-- Right now several tables have TWO overlapping RLS policies for the same
-- command: one correctly scoped (checks channel membership), and one wide
-- open ("... readable by authenticated users" / USING (true), or an INSERT
-- policy that only checks auth.uid() = author_id with no membership check).
--
-- Postgres combines multiple *permissive* policies for the same command
-- with OR. That means the most permissive one wins. Concretely, today:
--   * Any authenticated user can read messages/channels/members for a
--     PRIVATE channel they are not a member of, because
--     "messages readable by authenticated users" / "channels readable by
--     authenticated users" / "members readable by authenticated users"
--     (all USING (true)) sit alongside the correctly-scoped policies.
--   * Any authenticated user can INSERT a message into a private channel
--     they are not a member of, because "users create messages" only
--     checks (auth.uid() = author_id), with no membership check, sitting
--     alongside messages_insert_allowed / messages_insert_own which DO
--     check membership.
--
-- This migration removes only the redundant permissive policies, leaving
-- the properly-scoped one (or ones) in place for each table/command. It
-- does NOT touch is_channel_member(), is_private_channel_member(), or any
-- of the correctly-scoped policies.
--
-- WHAT CHANGES FOR USERS: private channels become actually private at the
-- database level. If any current member relies on the open behavior (e.g.
-- a user who can currently see/post in a private channel without being a
-- channel_members row), that access goes away after this runs. Read-only
-- and public-channel behavior for everyone else is unaffected.
--
-- Run this only when you're ready for that change. Safe to run multiple
-- times (idempotent) once you do.

drop policy if exists "messages readable by authenticated users" on public.messages;
drop policy if exists "users create messages" on public.messages;
drop policy if exists "users delete own messages" on public.messages;
drop policy if exists "users edit own messages" on public.messages;

drop policy if exists "channels readable by authenticated users" on public.channels;

drop policy if exists "members readable by authenticated users" on public.channel_members;
