-- Comms — Cohort communications (prefixed to coexist with FlexiFlow tables)
create extension if not exists "pgcrypto";

create table if not exists public.comms_users (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  email text not null unique,
  username text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'MEMBER' check (role in ('MEMBER', 'ADMIN')),
  created_at timestamptz not null default now()
);

create table if not exists public.comms_channels (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  name text not null,
  slug text not null unique,
  description text not null default '',
  kind text not null default 'public' check (kind in ('public', 'announcements')),
  archived boolean not null default false,
  created_by_id text not null references public.comms_users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comms_conversations (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  kind text not null default 'dm' check (kind in ('dm')),
  dm_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.comms_conversation_members (
  conversation_id text not null references public.comms_conversations (id) on delete cascade,
  user_id text not null references public.comms_users (id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table if not exists public.comms_messages (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  channel_id text references public.comms_channels (id) on delete cascade,
  conversation_id text references public.comms_conversations (id) on delete cascade,
  author_id text not null references public.comms_users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comms_messages_target_check check (
    (channel_id is not null and conversation_id is null)
    or (channel_id is null and conversation_id is not null)
  )
);

create index if not exists comms_messages_channel_created_idx
  on public.comms_messages (channel_id, created_at desc);
create index if not exists comms_messages_conversation_created_idx
  on public.comms_messages (conversation_id, created_at desc);
create index if not exists comms_messages_body_lower_idx
  on public.comms_messages (lower(body));

create table if not exists public.comms_notifications (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  user_id text not null references public.comms_users (id) on delete cascade,
  body text not null,
  link text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comms_notifications_user_created_idx
  on public.comms_notifications (user_id, created_at desc);

alter table public.comms_users enable row level security;
alter table public.comms_channels enable row level security;
alter table public.comms_conversations enable row level security;
alter table public.comms_conversation_members enable row level security;
alter table public.comms_messages enable row level security;
alter table public.comms_notifications enable row level security;
