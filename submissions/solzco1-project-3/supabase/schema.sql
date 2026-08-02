-- Pulse · Supabase schema
-- Run in Supabase SQL editor for production

create table if not exists partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  company text not null,
  email text not null,
  interest text not null,
  student_handles text[] not null default '{}',
  message text not null,
  inquiry_type text not null default 'intro',
  created_at timestamptz not null default now()
);

create table if not exists activity_feed (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table partner_inquiries enable row level security;
alter table activity_feed enable row level security;

create policy "anon insert partner inquiries"
  on partner_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "public read activity feed"
  on activity_feed for select
  to anon, authenticated
  using (true);

create index if not exists activity_feed_created_at_idx
  on activity_feed (created_at desc);
