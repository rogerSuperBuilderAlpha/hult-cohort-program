-- Conexus schema — PRD §3
-- Apply with: npm run db:apply

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('active', 'pending', 'deactivated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.channel_type as enum ('public', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_level as enum ('all', 'mentions', 'mute');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.conversation_type as enum ('dm', 'group_dm');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_parent_type as enum ('channel', 'conversation');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles (= User in PRD §3); id mirrors auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  role public.user_role not null default 'member',
  status public.user_status not null default 'pending',
  forth_user_ref text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_status_idx on public.profiles (status);

-- ---------------------------------------------------------------------------
-- workspace (single workspace for the cohort)
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- channels + membership
-- ---------------------------------------------------------------------------
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text not null default '',
  type public.channel_type not null default 'public',
  created_by uuid references public.profiles (id) on delete set null,
  is_archived boolean not null default false,
  admin_post_only boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create index if not exists channels_workspace_idx on public.channels (workspace_id);

create table if not exists public.channel_members (
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  notification_level public.notification_level not null default 'all',
  joined_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create index if not exists channel_members_user_idx on public.channel_members (user_id);

-- ---------------------------------------------------------------------------
-- DMs (Conversation ≠ channel)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_members_user_idx on public.conversation_members (user_id);

-- ---------------------------------------------------------------------------
-- messages (threads = messages with thread_root_id)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  parent_type public.message_parent_type not null,
  parent_id uuid not null,
  thread_root_id uuid references public.messages (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body_richtext text not null default '',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists messages_parent_idx
  on public.messages (parent_type, parent_id, created_at desc);

create index if not exists messages_thread_root_idx
  on public.messages (thread_root_id, created_at)
  where thread_root_id is not null;

create index if not exists messages_author_idx on public.messages (author_id);

-- ---------------------------------------------------------------------------
-- reactions, attachments, mentions
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists attachments_message_idx on public.attachments (message_id);

create table if not exists public.mentions (
  message_id uuid not null references public.messages (id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, mentioned_user_id)
);

-- ---------------------------------------------------------------------------
-- Forth TicketLink + notifications + integration config
-- ---------------------------------------------------------------------------
create table if not exists public.ticket_links (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages (id) on delete set null,
  channel_id uuid not null references public.channels (id) on delete cascade,
  forth_ticket_id text not null,
  forth_url text not null,
  title_snapshot text not null,
  status_snapshot text not null,
  assignee_email_snapshot text,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);

create index if not exists ticket_links_channel_idx on public.ticket_links (channel_id);
create index if not exists ticket_links_forth_ticket_idx on public.ticket_links (forth_ticket_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  entity_ref text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

create table if not exists public.integration_configs (
  id uuid primary key default gen_random_uuid(),
  forth_base_url text not null,
  shared_api_key_encrypted text,
  webhook_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roster allowlist (used by Auth step; included so seed can provision emails)
-- ---------------------------------------------------------------------------
create table if not exists public.roster_allowlist (
  email text primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Realtime publication (messages + notifications per PRD §6)
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end $$;
