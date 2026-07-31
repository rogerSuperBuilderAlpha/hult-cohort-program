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
