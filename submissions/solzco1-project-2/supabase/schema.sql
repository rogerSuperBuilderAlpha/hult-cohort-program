-- Comms platform schema (run in Supabase SQL editor)

create extension if not exists "pgcrypto";

-- Profiles (synced on signup via trigger or app)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- Channels (is_dm = true for 1:1 conversations)
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  is_dm boolean not null default false,
  archived boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists channels_slug_idx on public.channels (slug) where slug is not null;
create index if not exists channels_is_dm_idx on public.channels (is_dm);

-- Channel membership
create table if not exists public.channel_members (
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

-- Messages (parent_id enables reply threads)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  body text not null,
  parent_id uuid references public.messages (id) on delete cascade,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_created_idx on public.messages (channel_id, created_at);
create index if not exists messages_parent_idx on public.messages (parent_id);
create index if not exists messages_body_search_idx on public.messages using gin (to_tsvector('english', body));

-- In-app notifications (@mentions, DMs)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('mention', 'dm')),
  message_id uuid references public.messages (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications (user_id, read_at);

-- Realtime
alter publication supabase_realtime add table public.messages;

-- Seed public channels (idempotent by slug)
insert into public.channels (name, slug, is_dm, created_by)
values
  ('General', 'general', false, null),
  ('Announcements', 'announcements', false, null),
  ('Reviews', 'reviews', false, null),
  ('Forth Updates', 'forth-updates', false, null)
on conflict (slug) do nothing;

-- Helper: is user admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

-- Helper: announcements channel id
create or replace function public.announcements_channel_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.channels where slug = 'announcements' limit 1;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Profiles readable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Channels: public non-DM visible to all authenticated; DMs only for members
create policy "View public channels"
  on public.channels for select
  to authenticated
  using (
    (not is_dm and not archived)
    or exists (
      select 1 from public.channel_members cm
      where cm.channel_id = channels.id and cm.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

create policy "Authenticated create channels"
  on public.channels for insert
  to authenticated
  with check (auth.uid() = created_by or created_by is null);

create policy "Creator or admin update channels"
  on public.channels for update
  to authenticated
  using (created_by = auth.uid() or public.is_admin(auth.uid()));

-- Channel members
create policy "View members of accessible channels"
  on public.channel_members for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_members.channel_id
        and (
          (not c.is_dm)
          or exists (
            select 1 from public.channel_members cm2
            where cm2.channel_id = c.id and cm2.user_id = auth.uid()
          )
        )
    )
  );

create policy "Join or create membership"
  on public.channel_members for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Messages
create policy "Read messages in accessible channels"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = messages.channel_id
        and (
          (not c.is_dm and not c.archived)
          or exists (
            select 1 from public.channel_members cm
            where cm.channel_id = c.id and cm.user_id = auth.uid()
          )
          or public.is_admin(auth.uid())
        )
    )
  );

create policy "Post messages with rules"
  on public.messages for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.channels c
      where c.id = messages.channel_id
        and (
          (
            c.slug = 'announcements'
            and public.is_admin(auth.uid())
          )
          or (
            c.slug is distinct from 'announcements'
            and (
              (not c.is_dm)
              or exists (
                select 1 from public.channel_members cm
                where cm.channel_id = c.id and cm.user_id = auth.uid()
              )
            )
          )
        )
    )
  );

-- Service role bypass for webhooks (use service client in API route)

-- Notifications
create policy "Users read own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

create policy "Insert notifications for others"
  on public.notifications for insert
  to authenticated
  with check (true);
