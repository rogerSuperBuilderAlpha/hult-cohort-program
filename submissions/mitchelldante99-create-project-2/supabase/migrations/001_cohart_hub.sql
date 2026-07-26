-- Cohart Hub production foundation
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New member',
  username text unique,
  avatar_url text,
  bio text,
  status text not null default 'online' check (status in ('online','away','offline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','admin')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text not null default '◈',
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  unique(space_id, slug)
);

create table if not exists public.channel_members (
  channel_id uuid references public.channels(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(channel_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.messages(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reactions (
  message_id uuid references public.messages(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key(message_id, user_id, emoji)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  message_id uuid references public.messages(id) on delete cascade,
  kind text not null check (kind in ('mention','reply','announcement','project')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_created_idx on public.messages(channel_id, created_at desc);
create index if not exists channel_members_user_idx on public.channel_members(user_id);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

create or replace function public.is_cohort_member(target_user uuid default auth.uid())
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.cohort_members where user_id = target_user and status = 'active');
$$;

create or replace function public.is_channel_member(target_channel uuid, target_user uuid default auth.uid())
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.channel_members where channel_id = target_channel and user_id = target_user);
$$;

create or replace function public.can_access_channel(target_channel uuid, target_user uuid default auth.uid())
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from public.channels c
    where c.id = target_channel and (
      (c.is_private = false and public.is_cohort_member(target_user))
      or public.is_channel_member(c.id, target_user)
    )
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,'member'),'@',1)))
  on conflict (id) do nothing;
  insert into public.cohort_members (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.cohort_members enable row level security;
alter table public.spaces enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_read on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists cohort_member_read on public.cohort_members;
drop policy if exists spaces_read on public.spaces;
drop policy if exists channels_read on public.channels;
drop policy if exists channel_members_read on public.channel_members;
drop policy if exists channel_members_join_public on public.channel_members;
drop policy if exists channel_members_leave on public.channel_members;
drop policy if exists messages_read on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_update_own on public.messages;
drop policy if exists messages_delete_own on public.messages;
drop policy if exists reactions_read on public.message_reactions;
drop policy if exists reactions_manage_own on public.message_reactions;
drop policy if exists notifications_read_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;

create policy profiles_read on public.profiles for select to authenticated using (public.is_cohort_member());
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy cohort_member_read on public.cohort_members for select to authenticated using (public.is_cohort_member());
create policy spaces_read on public.spaces for select to authenticated using (public.is_cohort_member());
create policy channels_read on public.channels for select to authenticated using (public.can_access_channel(id));
create policy channel_members_read on public.channel_members for select to authenticated using (public.can_access_channel(channel_id));
create policy channel_members_join_public on public.channel_members for insert to authenticated with check (
  auth.uid() = user_id and exists(select 1 from public.channels c where c.id = channel_id and c.is_private = false) and public.is_cohort_member()
);
create policy channel_members_leave on public.channel_members for delete to authenticated using (auth.uid() = user_id);
create policy messages_read on public.messages for select to authenticated using (public.can_access_channel(channel_id));
create policy messages_insert on public.messages for insert to authenticated with check (auth.uid() = author_id and public.can_access_channel(channel_id));
create policy messages_update_own on public.messages for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy messages_delete_own on public.messages for delete to authenticated using (auth.uid() = author_id);
create policy reactions_read on public.message_reactions for select to authenticated using (
  exists(select 1 from public.messages m where m.id = message_id and public.can_access_channel(m.channel_id))
);
create policy reactions_manage_own on public.message_reactions for all to authenticated using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists(select 1 from public.messages m where m.id = message_id and public.can_access_channel(m.channel_id))
);
create policy notifications_read_own on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy notifications_update_own on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.spaces (name, slug, description, icon) values
('Cohort Central','cohort-central','The main home for the Hult Summer Pilot 2026 cohort.','✦'),
('Project Spaces','project-spaces','Build together, share progress, and collaborate.','◆')
on conflict (slug) do nothing;

insert into public.channels (space_id,name,slug,description,is_private)
select s.id, v.name, v.slug, v.description, false
from public.spaces s cross join (values
('Announcements','announcements','Official cohort updates and important announcements.'),
('General','general','The main conversation space for the cohort.'),
('Introductions','introductions','Introduce yourself and meet the cohort.'),
('Help & Support','help-and-support','Ask questions and help each other.')
) v(name,slug,description)
where s.slug='cohort-central'
on conflict (space_id,slug) do nothing;

insert into public.channels (space_id,name,slug,description,is_private)
select s.id, v.name, v.slug, v.description, false
from public.spaces s cross join (values
('Project Lounge','project-lounge','A shared space for project collaboration.')
) v(name,slug,description)
where s.slug='project-spaces'
on conflict (space_id,slug) do nothing;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='message_reactions') then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;
