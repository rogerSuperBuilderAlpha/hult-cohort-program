-- ============================================================
-- Hult Cohort 67 — Complete database setup (all-in-one)
-- Paste this ENTIRE file into: Supabase dashboard → SQL Editor
-- → New query → Run. Safe to run once on a fresh project.
--
-- This is the six migration files combined, in the order they
-- must run: schema, passcodes, organizer hide/unhide, rate
-- limiting, organizer passcode reset, multi-project support.
-- ============================================================


-- ============================================================
-- PART 1 of 6 — schema.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Supabase schema
-- Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- Participant profiles (the cohort wall)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text generated always as (lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))) stored,
  handle text,
  color text default 'coral',
  title text,
  tagline text,
  url text,
  tags text[] default '{}',
  flag_count int default 0,
  hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists profiles_name_key_idx on profiles (name_key);

-- Peer reviews (private — only queryable by exact target name match)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  target_name text not null,
  target_name_key text generated always as (lower(regexp_replace(trim(target_name), '[^a-zA-Z0-9]+', '-', 'g'))) stored,
  reviewer_name text not null,
  review_text text not null,
  vote text default 'up' check (vote in ('up', 'abstain')),
  created_at timestamptz default now()
);

create index if not exists reviews_target_key_idx on reviews (target_name_key);

-- Row Level Security: allow public read/write for this trusted-cohort use case.
-- (No user accounts in this app, so we can't scope by auth.uid(). This matches
-- the "trusted cohort, not high-security" bar we discussed.)
alter table profiles enable row level security;
alter table reviews enable row level security;

create policy "public can read profiles" on profiles for select using (true);
create policy "public can insert profiles" on profiles for insert with check (true);
create policy "public can update profiles" on profiles for update using (true);

create policy "public can insert reviews" on reviews for insert with check (true);
create policy "public can read reviews" on reviews for select using (true);

-- Done. After running this, go to Project Settings → API and grab:
--   Project URL
--   anon public key
-- and send both back so the site can be wired up.


-- ============================================================
-- PART 2 of 6 — add-passcode-migration.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Add passcode-protected edit/delete
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- Safe to run even if you already ran the original schema.sql —
-- this only adds new things, it doesn't touch existing data.
-- ============================================================

-- 1. Add a passcode column (stores a hash, never the raw passcode)
alter table profiles add column if not exists passcode_hash text;

-- 2. Lock down direct table access — updates/deletes must go through
--    the functions below, which check the passcode server-side.
--    (Inserts stay open since that's how new profiles get created.)
drop policy if exists "public can update profiles" on profiles;

-- No general "update" or "delete" policy on profiles anymore —
-- this means the REST API can no longer update/delete rows directly,
-- only through the secure functions below.

-- 3. Secure functions: these run with elevated rights internally,
--    but only ever apply the change if the hash matches.

create or replace function update_profile_with_passcode(
  p_name_key text,
  p_passcode text,
  p_updates jsonb
) returns boolean
language plpgsql
security definer
as $$
declare
  v_match boolean;
begin
  select (passcode_hash = crypt(p_passcode, passcode_hash)) into v_match
  from profiles where name_key = p_name_key;

  if v_match is not true then
    return false;
  end if;

  update profiles set
    handle = coalesce(p_updates->>'handle', handle),
    color = coalesce(p_updates->>'color', color),
    title = coalesce(p_updates->>'title', title),
    tagline = coalesce(p_updates->>'tagline', tagline),
    url = coalesce(p_updates->>'url', url),
    tags = case when p_updates ? 'tags'
                then array(select jsonb_array_elements_text(p_updates->'tags'))
                else tags end,
    updated_at = now()
  where name_key = p_name_key;

  return true;
end;
$$;

create or replace function delete_profile_with_passcode(
  p_name_key text,
  p_passcode text
) returns boolean
language plpgsql
security definer
as $$
declare
  v_match boolean;
begin
  select (passcode_hash = crypt(p_passcode, passcode_hash)) into v_match
  from profiles where name_key = p_name_key;

  if v_match is not true then
    return false;
  end if;

  delete from profiles where name_key = p_name_key;
  return true;
end;
$$;

-- 4. Make sure pgcrypto (for crypt/gen_salt) is available
create extension if not exists pgcrypto;

-- Done. Existing profiles created before this migration will have a
-- null passcode_hash, meaning update/delete will correctly fail for
-- them until they resubmit and set a passcode.

-- Note: insert_profile_with_passcode is defined once, later in this
-- file (Part 4), already including the rate-limiting p_client_tag
-- argument — no need for an earlier version here, since creating it
-- twice with different argument lists causes a "function name is not
-- unique" ambiguity error in Postgres.

-- Allow the anon role to call these functions (RPC access)
grant execute on function update_profile_with_passcode to anon;
grant execute on function delete_profile_with_passcode to anon;



-- ============================================================
-- PART 3 of 6 — add-organizer-function.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Organizer hide/unhide function
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- Lets the site's Organizer tab hide/unhide any profile without
-- needing that person's passcode. Access to this function is only
-- gated by the client-side organizer password in the site itself —
-- not by anything in the database. That's an intentional tradeoff
-- for a trusted-cohort tool: don't rely on this for real security.

create or replace function organizer_set_hidden(
  p_id uuid,
  p_hidden boolean
) returns boolean
language plpgsql
security definer
as $$
begin
  update profiles set hidden = p_hidden where id = p_id;
  return true;
end;
$$;

grant execute on function organizer_set_hidden to anon;


-- ============================================================
-- PART 4 of 6 — add-rate-limiting.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Basic rate limiting
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================
--
-- Honest scope: this cannot see real IP addresses or device identity
-- from a static site talking directly to Supabase — there's no server
-- in between to read that from. What this DOES stop:
--   - Rapid repeated submissions in a short window (accidental double
--     -clicks, basic spam scripts hammering the endpoint)
--   - Excessive review submissions in a short window
-- What this does NOT stop:
--   - A determined attacker rotating fake names/values by hand
--   - Anyone willing to wait out the cooldown between attempts
-- For a trusted cohort, this raises the bar enough to stop casual
-- abuse without needing real infrastructure (a server, IP logging, etc).

-- Tracking table: one row per submission attempt, auto-expires logically
-- (we just query recent rows, nothing needs manual cleanup for this scale)
create table if not exists submission_log (
  id uuid primary key default gen_random_uuid(),
  action text not null, -- 'profile_insert' or 'review_insert'
  client_tag text not null, -- a loose identifier, see note in index.html
  created_at timestamptz default now()
);

create index if not exists submission_log_lookup_idx on submission_log (action, client_tag, created_at);

-- Replace insert_profile_with_passcode to add a rate check first
create or replace function insert_profile_with_passcode(
  p_name text,
  p_passcode text,
  p_handle text,
  p_color text,
  p_title text,
  p_tagline text,
  p_url text,
  p_tags text[],
  p_client_tag text default 'unknown'
) returns table(id uuid)
language plpgsql
security definer
as $$
declare
  v_recent_count int;
begin
  select count(*) into v_recent_count
  from submission_log
  where action = 'profile_insert'
    and client_tag = p_client_tag
    and created_at > now() - interval '60 seconds';

  if v_recent_count >= 3 then
    raise exception 'rate_limited';
  end if;

  insert into submission_log (action, client_tag) values ('profile_insert', p_client_tag);

  return query
  insert into profiles (name, passcode_hash, handle, color, title, tagline, url, tags)
  values (p_name, crypt(p_passcode, gen_salt('bf')), p_handle, p_color, p_title, p_tagline, p_url, p_tags)
  returning profiles.id;
end;
$$;

grant execute on function insert_profile_with_passcode to anon;

-- Add the same style of guard as a standalone check function for reviews
-- (reviews use a plain insert today, not a wrapper function, so we add one)
create or replace function insert_review_rate_checked(
  p_target_name text,
  p_reviewer_name text,
  p_review_text text,
  p_vote text,
  p_client_tag text default 'unknown'
) returns boolean
language plpgsql
security definer
as $$
declare
  v_recent_count int;
begin
  select count(*) into v_recent_count
  from submission_log
  where action = 'review_insert'
    and client_tag = p_client_tag
    and created_at > now() - interval '60 seconds';

  if v_recent_count >= 5 then
    raise exception 'rate_limited';
  end if;

  insert into submission_log (action, client_tag) values ('review_insert', p_client_tag);

  insert into reviews (target_name, reviewer_name, review_text, vote)
  values (p_target_name, p_reviewer_name, p_review_text, p_vote);

  return true;
end;
$$;

grant execute on function insert_review_rate_checked to anon;


-- ============================================================
-- PART 5 of 6 — add-organizer-passcode-reset.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Organizer passcode reset
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- Lets the Organizer tab set a NEW passcode for someone who forgot
-- theirs. This never reveals or requires the OLD passcode — it just
-- overwrites it with a new one the organizer types in (which they
-- should then relay to the participant, e.g. "your new passcode is X").
-- Access is only gated by the client-side organizer password in the
-- site itself, same tradeoff as the hide/unhide function.

create or replace function organizer_reset_passcode(
  p_name_key text,
  p_new_passcode text
) returns boolean
language plpgsql
security definer
as $$
begin
  update profiles
  set passcode_hash = crypt(p_new_passcode, gen_salt('bf'))
  where name_key = p_name_key;

  return found;
end;
$$;

grant execute on function organizer_reset_passcode to anon;


-- ============================================================
-- PART 6 of 6 — add-multi-projects.sql
-- ============================================================

-- ============================================================
-- Hult Cohort 67 — Multiple projects per profile
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================
--
-- This adds support for a profile having MANY projects, each with
-- up to 3 optional links (live site, repo, demo video). It does not
-- touch or remove the existing single title/tagline/url/tags fields
-- on `profiles` — those stay as-is for backward compatibility with
-- anything already submitted, but new submissions will primarily
-- use this new `projects` table instead.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  tagline text,
  live_url text,
  repo_url text,
  demo_url text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_profile_id_idx on projects (profile_id);

alter table projects enable row level security;

create policy "public can read projects" on projects for select using (true);

-- No public insert/update/delete policy — all writes to `projects` go
-- through the passcode-checked functions below, same pattern as profiles.

-- Add a project to a profile (requires the profile owner's passcode)
create or replace function add_project_with_passcode(
  p_name_key text,
  p_passcode text,
  p_title text,
  p_tagline text,
  p_live_url text,
  p_repo_url text,
  p_demo_url text,
  p_tags text[]
) returns uuid
language plpgsql
security definer
as $$
declare
  v_match boolean;
  v_profile_id uuid;
  v_new_id uuid;
begin
  select (passcode_hash = crypt(p_passcode, passcode_hash)), id
    into v_match, v_profile_id
  from profiles where name_key = p_name_key;

  if v_match is not true then
    return null;
  end if;

  insert into projects (profile_id, title, tagline, live_url, repo_url, demo_url, tags)
  values (v_profile_id, p_title, p_tagline, p_live_url, p_repo_url, p_demo_url, p_tags)
  returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function add_project_with_passcode to anon;

-- Edit an existing project (requires the profile owner's passcode)
create or replace function update_project_with_passcode(
  p_name_key text,
  p_passcode text,
  p_project_id uuid,
  p_title text,
  p_tagline text,
  p_live_url text,
  p_repo_url text,
  p_demo_url text,
  p_tags text[]
) returns boolean
language plpgsql
security definer
as $$
declare
  v_match boolean;
  v_profile_id uuid;
begin
  select (passcode_hash = crypt(p_passcode, passcode_hash)), id
    into v_match, v_profile_id
  from profiles where name_key = p_name_key;

  if v_match is not true then
    return false;
  end if;

  update projects set
    title = p_title,
    tagline = p_tagline,
    live_url = p_live_url,
    repo_url = p_repo_url,
    demo_url = p_demo_url,
    tags = p_tags,
    updated_at = now()
  where id = p_project_id and profile_id = v_profile_id;

  return found;
end;
$$;

grant execute on function update_project_with_passcode to anon;

-- Delete a project (requires the profile owner's passcode)
create or replace function delete_project_with_passcode(
  p_name_key text,
  p_passcode text,
  p_project_id uuid
) returns boolean
language plpgsql
security definer
as $$
declare
  v_match boolean;
  v_profile_id uuid;
begin
  select (passcode_hash = crypt(p_passcode, passcode_hash)), id
    into v_match, v_profile_id
  from profiles where name_key = p_name_key;

  if v_match is not true then
    return false;
  end if;

  delete from projects where id = p_project_id and profile_id = v_profile_id;

  return found;
end;
$$;

grant execute on function delete_project_with_passcode to anon;
