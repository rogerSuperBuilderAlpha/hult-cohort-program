-- Comentiq — 001_schema.sql
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Do not run via CLI / DATABASE_URL.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('participant', 'admin');
create type public.profile_status as enum ('incomplete', 'published', 'unpublished');
create type public.project_stage as enum ('idea', 'building', 'launched', 'pilot', 'scaling');
create type public.project_status as enum ('draft', 'published', 'unpublished');
create type public.campaign_status as enum ('draft', 'approved', 'archived');
create type public.content_channel as enum ('linkedin', 'x', 'instagram', 'partner_summary');
create type public.content_status as enum ('generated', 'edited', 'approved', 'rejected');
create type public.amplification_status as enum ('draft', 'shared');
create type public.analytics_event_type as enum (
  'profile_view',
  'project_view',
  'campaign_view',
  'link_click',
  'share_action',
  'amplification_action',
  'partner_enquiry_submitted'
);
create type public.enquiry_status as enum ('new', 'in_progress', 'closed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null,
  role public.user_role not null default 'participant',
  avatar_url text,
  biography text,
  location text,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  website_url text,
  github_profile_url text,
  profile_status public.profile_status not null default 'incomplete',
  visible_to_partners boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  mission text,
  tagline text,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null,
  tagline text,
  summary text,
  description text,
  problem text,
  solution text,
  target_audience text,
  technology_stack text[] not null default '{}',
  stage public.project_stage not null default 'idea',
  live_url text,
  github_url text,
  demo_url text,
  image_url text,
  needs text[] not null default '{}',
  sectors text[] not null default '{}',
  status public.project_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, slug)
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  achievements text[] not null default '{}',
  challenges text[] not null default '{}',
  lessons text[] not null default '{}',
  next_steps text[] not null default '{}',
  evidence_links text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  project_update_id uuid references public.project_updates (id) on delete set null,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  story_angle text,
  why_angle_matters text,
  audience text[] not null default '{}',
  core_message text,
  evidence text[] not null default '{}',
  call_to_action text,
  status public.campaign_status not null default 'draft',
  tracking_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.campaign_content (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  channel public.content_channel not null,
  content text not null,
  status public.content_status not null default 'generated',
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, channel)
);

create table public.amplifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  participant_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  status public.amplification_status not null default 'draft',
  shared_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid references public.cohorts (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  campaign_id uuid references public.campaigns (id) on delete set null,
  event_type public.analytics_event_type not null,
  source text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.partner_enquiries (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  participant_id uuid references public.profiles (id) on delete set null,
  organization text not null,
  contact_name text not null,
  email text not null,
  interest_type text not null,
  message text,
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index profiles_profile_status_idx on public.profiles (profile_status);
create index profiles_email_idx on public.profiles (email);
create index projects_owner_id_idx on public.projects (owner_id);
create index projects_cohort_id_idx on public.projects (cohort_id);
create index projects_status_idx on public.projects (status);
create index projects_featured_idx on public.projects (featured) where featured = true;
create index project_updates_project_id_idx on public.project_updates (project_id);
create index campaigns_project_id_idx on public.campaigns (project_id);
create index campaigns_creator_id_idx on public.campaigns (creator_id);
create index campaigns_status_idx on public.campaigns (status);
create index campaign_content_campaign_id_idx on public.campaign_content (campaign_id);
create index campaign_content_status_idx on public.campaign_content (status);
create index amplifications_campaign_id_idx on public.amplifications (campaign_id);
create index amplifications_participant_id_idx on public.amplifications (participant_id);
create index analytics_events_cohort_id_idx on public.analytics_events (cohort_id);
create index analytics_events_event_type_idx on public.analytics_events (event_type);
create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index partner_enquiries_cohort_id_idx on public.partner_enquiries (cohort_id);
create index partner_enquiries_status_idx on public.partner_enquiries (status);
create index partner_enquiries_created_at_idx on public.partner_enquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at helper + role-escalation guard
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- Block clients from changing privileged columns (role).
-- Service-role JWT may update role (auth callback / ensure-profile).
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.jwt() ->> 'role', '');

  if jwt_role = 'service_role' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Updating profiles.role is not allowed';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row
execute function public.prevent_profile_privilege_escalation();

-- ---------------------------------------------------------------------------
-- RLS enablement
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cohorts enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_content enable row level security;
alter table public.amplifications enable row level security;
alter table public.analytics_events enable row level security;
alter table public.partner_enquiries enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies
-- Admin / privileged writes use the service-role client (bypasses RLS).
-- ---------------------------------------------------------------------------

-- profiles
create policy "profiles_select_published"
on public.profiles
for select
to anon, authenticated
using (profile_status = 'published');

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Inserts are performed by ensure-profile (service role). No insert policy for clients.

-- cohorts (public read of active cohort metadata)
create policy "cohorts_select_all"
on public.cohorts
for select
to anon, authenticated
using (true);

-- projects
create policy "projects_select_published"
on public.projects
for select
to anon, authenticated
using (status = 'published');

create policy "projects_select_own"
on public.projects
for select
to authenticated
using (auth.uid() = owner_id);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (auth.uid() = owner_id);

-- project_updates
create policy "project_updates_select_published_project"
on public.project_updates
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.status = 'published'
  )
);

create policy "project_updates_select_own"
on public.project_updates
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "project_updates_insert_own"
on public.project_updates
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "project_updates_update_own"
on public.project_updates
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.owner_id = auth.uid()
  )
);

create policy "project_updates_delete_own"
on public.project_updates
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_updates.project_id
      and p.owner_id = auth.uid()
  )
);

-- campaigns
create policy "campaigns_select_own"
on public.campaigns
for select
to authenticated
using (auth.uid() = creator_id);

create policy "campaigns_select_approved_on_published_project"
on public.campaigns
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1
    from public.projects p
    where p.id = campaigns.project_id
      and p.status = 'published'
  )
);

create policy "campaigns_insert_own"
on public.campaigns
for insert
to authenticated
with check (auth.uid() = creator_id);

create policy "campaigns_update_own"
on public.campaigns
for update
to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "campaigns_delete_own"
on public.campaigns
for delete
to authenticated
using (auth.uid() = creator_id);

-- campaign_content
create policy "campaign_content_select_own_campaign"
on public.campaign_content
for select
to authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_content.campaign_id
      and c.creator_id = auth.uid()
  )
);

create policy "campaign_content_select_approved_public"
on public.campaign_content
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1
    from public.campaigns c
    join public.projects p on p.id = c.project_id
    where c.id = campaign_content.campaign_id
      and p.status = 'published'
  )
);

create policy "campaign_content_insert_own_campaign"
on public.campaign_content
for insert
to authenticated
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_content.campaign_id
      and c.creator_id = auth.uid()
  )
);

create policy "campaign_content_update_own_campaign"
on public.campaign_content
for update
to authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_content.campaign_id
      and c.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_content.campaign_id
      and c.creator_id = auth.uid()
  )
);

create policy "campaign_content_delete_own_campaign"
on public.campaign_content
for delete
to authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = campaign_content.campaign_id
      and c.creator_id = auth.uid()
  )
);

-- amplifications
create policy "amplifications_select_own"
on public.amplifications
for select
to authenticated
using (auth.uid() = participant_id);

create policy "amplifications_select_as_campaign_creator"
on public.amplifications
for select
to authenticated
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = amplifications.campaign_id
      and c.creator_id = auth.uid()
  )
);

create policy "amplifications_insert_own"
on public.amplifications
for insert
to authenticated
with check (auth.uid() = participant_id);

create policy "amplifications_update_own"
on public.amplifications
for update
to authenticated
using (auth.uid() = participant_id)
with check (auth.uid() = participant_id);

-- analytics_events: no client policies (insert/read via service role only)

-- partner_enquiries: no client policies (insert/read via service role only)

-- ---------------------------------------------------------------------------
-- Seed: Hult Summer Cohort 2026
-- ---------------------------------------------------------------------------
insert into public.cohorts (name, slug, description, mission, tagline, status)
values (
  'Hult Summer Cohort 2026',
  'hult-summer-2026',
  'Hult Cohort Developer Program Summer Pilot 2026.',
  'Turn individual project progress into coordinated stories, peer amplification, and partner discovery.',
  'Where individual brilliance becomes collective momentum.',
  'active'
)
on conflict (slug) do nothing;
