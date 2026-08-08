# Phase A — Ludwitt Pipeline First (Effective Facilitation)

## Context for the agent

You're building a production Next.js (App Router) + Supabase app called **Effective Facilitation** — a short learning course teaching three "developmental paths" of judgment-under-AI-uncertainty, each made of 3 disciplines with a diagnostic scenario per discipline.

This is **Phase A only**. The goal of Phase A is NOT to build the course content. It is to prove the Ludwitt integration pipeline end-to-end — launch → auth → event firing → metrics — using placeholder/fake lesson content. Course content (the 9 disciplines, 9 scenarios) comes in Phase A2, after this pipe is proven working. This sequencing is deliberate: if the event wiring is broken, we need to know by Wednesday, not after a week of writing lesson copy.

Stop and report back after each checkpoint below. Do not proceed to the next checkpoint until told to continue.

Stack: Next.js (App Router), Supabase (Postgres + Auth not used — Ludwitt handles identity), Tailwind CSS, Vercel, TypeScript. Environment is Windows/PowerShell. Supabase migrations are run manually by the human in the Supabase SQL Editor — **never** generate a `DATABASE_URL` connection step or attempt to run migrations via CLI or `supabase db push`. Always output SQL in a labeled code block for manual review and execution instead.

---

## Checkpoint 1 — Project scaffold + schema SQL

1. Scaffold a new Next.js App Router project (`create-next-app`, TypeScript, Tailwind, App Router, no `src/` directory needed — match prior project conventions).
2. Add `.env.local.example` with these keys (values blank, to be filled after Ludwitt registration in Checkpoint 2):
   ```
   LUDWITT_APP_ID=
   LUDWITT_API_KEY=
   LUDWITT_JWT_SECRET=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=
   ```
3. Add `.env.local` to `.gitignore` (verify it's not already tracked).
4. Write the schema migration SQL as a single file at `supabase/migrations/0001_init.sql`, and **also print it in your response** so it can be reviewed before I paste it into the Supabase SQL Editor. Do not attempt to execute it yourself. Schema:

```sql
create table paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  sort_order int not null
);

create table disciplines (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references paths(id) not null,
  slug text unique not null,
  title text not null,
  sort_order int not null,
  content_md text not null default '',
  counterfeit_md text not null default ''
);

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  discipline_id uuid references disciplines(id) not null,
  prompt_md text not null default '',
  rubric_md text not null default ''
);

create table app_users (
  id uuid primary key default gen_random_uuid(),
  ludwitt_sub text unique not null,
  email text,
  created_at timestamptz not null default now()
);

create table progress (
  user_id uuid references app_users(id) not null,
  discipline_id uuid references disciplines(id) not null,
  started_at timestamptz,
  completed_at timestamptz,
  scenario_response text,
  scenario_at timestamptz,
  primary key (user_id, discipline_id)
);

create table path_completions (
  user_id uuid references app_users(id) not null,
  path_id uuid references paths(id) not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, path_id)
);

create table ludwitt_event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  event_type text not null,
  payload jsonb not null,
  sent_at timestamptz not null default now(),
  http_status int,
  error text
);

-- RLS: lock everything down. No client-side reads/writes to these tables directly —
-- all access goes through server routes using the service role key.
alter table paths enable row level security;
alter table disciplines enable row level security;
alter table scenarios enable row level security;
alter table app_users enable row level security;
alter table progress enable row level security;
alter table path_completions enable row level security;
alter table ludwitt_event_log enable row level security;
-- No policies added — service role bypasses RLS by design; anon key gets zero access.
```

5. Seed 3 placeholder paths, 1 placeholder discipline each, 1 placeholder scenario each, as a second SQL file `supabase/migrations/0002_seed_placeholder.sql`, also printed for review. Use obviously-fake content like "Placeholder Discipline 1 — replace in Phase A2" so nothing is mistaken for real course copy later.

**Report back:** scaffold complete, both SQL files printed for my review. Wait for me to confirm I've run them in Supabase before continuing.

---

## Checkpoint 2 — Ludwitt registration + JWT verification

I will separately register the app at ludwitt.com/developers and provide you the `app_id`, `api_key`, and `jwt_secret` to put in `.env.local` myself (not committed, not printed by you).

Your job in this checkpoint:

1. Build `/launch` route (`app/launch/page.tsx` or a route handler at `app/api/launch/route.ts` — your call on which fits App Router better, but the page must end in either a valid session + redirect, or a clear rejection screen).
2. JWT verification logic in `lib/ludwitt/verifyLaunch.ts`:
   - Verify HS256 signature against `LUDWITT_JWT_SECRET`.
   - Verify `exp` (reject expired).
   - Require `sub`, `email`, `app_id` claims present; reject if `app_id` doesn't match `LUDWITT_APP_ID`.
   - **Anti-gaming check here, not later:** reject (treat as invalid) if `sub` or `email` contains my GitHub handle `lorra-v` (case-insensitive substring check) — this should be a named constant/list so I can add other cohort-member identifiers later without hunting through the code.
   - On any failure: render a plain page with the message **"Launch from Ludwitt/Hult"** and nothing else — no anonymous fallback, no way to proceed past this screen.
   - On success: upsert into `app_users` on `ludwitt_sub` (= `sub`), set an httpOnly session cookie (short-lived signed JWT of your own, separate secret from `LUDWITT_JWT_SECRET`), redirect to `/paths`.
3. Add server-side middleware (`middleware.ts`) that checks the session cookie for every route under `/paths` and below, redirecting to `/launch` (with the message, not a silent redirect loop) if missing/invalid. This is the only door in — there should be no public signup or guest mode anywhere in the app.
4. Write a small local dev helper script (`scripts/generate-test-token.ts`) that signs a fake launch JWT using `LUDWITT_JWT_SECRET` from `.env.local`, so I can test `/launch?token=...` locally without needing a real Ludwitt-issued token for every test. Print usage instructions.

**Report back:** what you built, how to run the test-token script, and what I should see when I hit `/launch` with a valid vs. expired vs. tampered token. Wait for me to confirm local testing works before continuing.

---

## Checkpoint 3 — Event firing + logging

1. Build `lib/ludwitt/events.ts` exporting a single function:
   ```ts
   sendLudwittEvent(userId: string, eventType: 'lesson_started' | 'lesson_completed' | 'quiz_submitted' | 'session_heartbeat', payload: Record<string, unknown>)
   ```
   It should: `POST` to the Ludwitt events endpoint with `LUDWITT_API_KEY`, and — regardless of success or failure — write a row to `ludwitt_event_log` with the event type, payload, response status, and error message if any. Never throw uncaught; log and return a result object `{ ok: boolean, status?: number, error?: string }` so callers can decide whether to surface anything to the user (they generally shouldn't — event delivery failures should be silent to the learner and visible only in the log table).
2. Wire calls into the placeholder discipline page from Checkpoint 1's seed data:
   - `lesson_started` when the page first loads for a user/discipline pair not yet in `progress`.
   - `quiz_submitted` when the placeholder scenario form is submitted (store `scenario_response` + `scenario_at` in `progress` at the same time).
   - `lesson_completed` when the user clicks a "mark complete" button — update `progress.completed_at`.
   - After writing `lesson_completed`, check if all disciplines in that path now have `completed_at` set for this user; if so, insert into `path_completions` (idempotent — don't error on conflict, just skip).
3. `session_heartbeat` on a `setInterval` (~120s) while a discipline page is open, only while the tab is visible (use the Page Visibility API to pause when backgrounded — don't waste event volume on idle tabs).

**Report back:** confirm all four event types fire correctly against the seed placeholder content, and show me what a row in `ludwitt_event_log` looks like for each type.

---

## Checkpoint 4 — Metrics check + smoke test

1. Build a simple internal `/admin/metrics` page (protected by a basic env-var-based password check, not full auth — this is just for you to watch numbers during the week, not a public feature) that:
   - Calls Ludwitt's `GET /v1/apps/{app_id}/metrics` and displays `qualified_users` raw.
   - Separately queries your own `path_completions` table and displays a count, so you can compare Ludwitt's number against your own stricter "finished a full path" number side by side.
2. Do a full manual smoke test end to end: generate a test token → land on `/launch` → verify redirect to `/paths` → open the placeholder discipline → submit the scenario → mark complete → confirm `path_completions` doesn't fire yet (only 1 of the seeded disciplines exists per path, so it should fire immediately in this placeholder setup — note if that's the case and flag it, since it's a seed-data artifact not a real bug) → check `/admin/metrics` shows movement.

**Report back:** results of the smoke test, and anything that looked off. This is the checkpoint where we decide the pipe is proven and move to Phase A2 (real content) or debug further.

---

## What NOT to do in this phase

- Don't write real course content (the 9 disciplines, scenarios) — placeholders only.
- Don't build the `/paths` listing UI beyond bare-minimum navigable links — no design polish yet.
- Don't touch Vercel deployment — this phase is localhost-only.
- Don't attempt to run Supabase migrations yourself — print SQL, I run it manually.
- Don't commit `.env.local` or print real key values back to me in chat once they're set — confirm they loaded ("LUDWITT_APP_ID is set") without echoing the value.
