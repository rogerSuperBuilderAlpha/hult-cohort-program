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

-- 5. Helper to insert a new profile with a hashed passcode
--    (so the app never needs to compute or send the raw hash itself)
create or replace function insert_profile_with_passcode(
  p_name text,
  p_passcode text,
  p_handle text,
  p_color text,
  p_title text,
  p_tagline text,
  p_url text,
  p_tags text[]
) returns table(id uuid) 
language plpgsql
security definer
as $$
begin
  return query
  insert into profiles (name, passcode_hash, handle, color, title, tagline, url, tags)
  values (p_name, crypt(p_passcode, gen_salt('bf')), p_handle, p_color, p_title, p_tagline, p_url, p_tags)
  returning profiles.id;
end;
$$;

-- 6. Allow the anon role to call these functions (RPC access)
grant execute on function insert_profile_with_passcode to anon;
grant execute on function update_profile_with_passcode to anon;
grant execute on function delete_profile_with_passcode to anon;

