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
