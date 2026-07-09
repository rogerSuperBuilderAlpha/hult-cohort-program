# Phase 2 metrics fallback (staff SOP)

When the Ludwitt/Hult metrics API is not yet production-ready, staff verify Phase 2 pass gates using this manual process.

## Learning app (≥25 qualified external users)

1. Collect each participant's production URL and app registration id (if registered).
2. Export user counts from platform snapshot CSV when API is available, or:
   - Request screenshot + analytics export from participant with date range covering week 6.
   - Verify users are not roster members (blocklist in [assessment/metrics.md](../../assessment/metrics.md)).
3. Record counts in staff spreadsheet: `handle`, `app_id`, `qualified_users`, `snapshot_date`.
4. Pass if `qualified_users >= 25` per [assessment/pass-fail.md](../../assessment/pass-fail.md).

## Venture (≥25 users + investor touch)

1. Same user count verification as learning app.
2. Investor touch: verify email or calendar log submitted by participant matches placement-lead criteria in metrics.md.
3. Confirm doc set exists in cohort repo (deck, plan, production URL).

## Open source (≥1 merged upstream PR)

1. Verify merged PR URL on qualified repo (≥1k stars or staff-approved list).
2. Confirm author matches participant GitHub handle.

## Publication

- Enter results in staff pass/fail worksheet before Aug 23–24 notification ([operations/calendar.md](../calendar.md)).
- Tell participants on dashboard that staff-verified gates were confirmed via email from cohort@hult.edu.
