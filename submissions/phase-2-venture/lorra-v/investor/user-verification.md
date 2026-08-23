# User Verification — Row-Level Breakdown

Full manual check against `app_users` and `ludwitt_event_log`, cross-referenced
against `progress` and `profile_results`. Performed 2026-08-17 after discovering
that local development and production share a single Supabase project, meaning
`app_users` contains testing rows alongside real signups.

**app_users total: 35 rows**

## Real users with confirmed qualifying activity (8)

| Email | Activity | First qualifying event |
|---|---|---|
| user-01 | Module progress (1 discipline started, 3 quiz answers) | 2026-08-11T19:39Z |
| user-02 | Module progress (1 discipline completed) | 2026-08-12T22:15Z |
| user-03 | Profile + 1 discipline completed | 2026-08-14T01:41Z |
| user-04 | Profile + 4 disciplines started | 2026-08-16 |
| user-05 | Profile + 1 discipline started | 2026-08-16 |
| user-06 | Profile + 1 discipline started | 2026-08-16 |
| user-07 | Profile + 1 discipline completed | 2026-08-16T01:17Z |
| user-08 | Profile + 1 discipline started | 2026-08-17 |

## Real user, engaged, no qualifying event (1)

| Email | Activity |
|---|---|
| user-09 | Completed profile assessment (2026-08-16T00:37Z) but no lesson/quiz event fired — does not meet Ludwitt's qualifying-event definition |

## Real signups, no activity (4)

user-10, user-11, user-12, user-13

## Excluded — founder test accounts (2)

| Email | Reason |
|---|---|
| founder test account 1 | Founder dev-testing account, 32 qualifying events logged |
| founder test account 2 | Founder smoke-test account (Checkpoint B), 0 qualifying events |

## Excluded — synthetic testing rows from development (20)

test1@example.com, smoke@example.com, smoke-a22@example.com, learner@example.com (×2, different subs), prod-smoke@example.com, debug@example.com, lorraine@example.com, wonder@example.com, kc-clickthrough@example.com, step-walkthrough@example.com, external.learner.769193@example.com, browser.repro.*@example.com, browser.ok.*@example.com, browser.autofill.*@example.com, sidebar-shot@example.com (×4)

## Note on Railway's `qualified_users: 12`

Railway's own count could not be verified against these rows individually — the
platform's event log does not record which app_id or environment each event
originated from, and local development testing has at times pointed at the
production Railway instance. The 8 confirmed above are verified independently
via direct `progress`/`profile_results` inspection and are the number cited in
this submission.
