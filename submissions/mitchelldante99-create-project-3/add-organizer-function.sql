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
