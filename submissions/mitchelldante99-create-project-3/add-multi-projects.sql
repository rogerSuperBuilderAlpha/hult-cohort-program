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
