# Phase 2 Learning App — @arjun-singh2127

**Circle Lab** — eight GCSE and IGCSE circle theorems, each one a diagram you
can drag. Every angle on screen is measured from the live figure, not captioned
from a textbook picture.

## Production listing URL

https://circle-lab.vercel.app

Build repo: https://github.com/arjun-singh2127/circle-lab

## Ludwitt / Hult app ID

`d0c2d586-b809-41c1-8751-e1d2621a1278`

## Integration route

**Cohort reference API (self-deployed).** The hosted Ludwitt developer portal
was not used — the cohort reference API is an accepted Week 4 path per
`execution/ludwitt-hult-api/README.md`.

- Platform API: https://platform-api-mu-henna.vercel.app
- Launch URL: https://circle-lab.vercel.app/launch
- Events authenticated with the **developer** key (`prod_key_demo`), not the
  per-app key returned at registration
- Platform registration is **env-seeded** (`SEED_*` vars on the platform-api
  Vercel project) so `app_id` and `jwt_secret` survive serverless cold starts

## Topic

Mathematics — circle theorems (GCSE / IGCSE). Eight theorems, each with a
draggable SVG figure, proof steps, and three exam-style questions. A theorem
clears when all three questions are right in one pass.

## What the integration does

1. Platform mints an HS256 launch JWT → learner hits `/launch?token=…`
2. Circle Lab verifies signature, checks `app_id`, exchanges for an HttpOnly
   session cookie, discards the token
3. Server posts `lesson_started`, `quiz_submitted`, `lesson_completed`, and
   `session_heartbeat` to the platform events API
4. Demo sessions build payloads and drop them — no made-up learners in metrics
5. Each lesson page shows a live event console distinguishing `counted` from
   `accepted, not counted` (sandbox key behaviour)

## Metrics snapshot (2026-08-09T03:35:00Z)

```json
{
  "app_id": "d0c2d586-b809-41c1-8751-e1d2621a1278",
  "production_listing_url": "https://circle-lab.vercel.app",
  "platform_api": "https://platform-api-mu-henna.vercel.app",
  "metrics": {
    "unique_users": 0,
    "qualified_users": 0
  },
  "snapshot_at": "2026-08-09T03:35:00Z",
  "note": "Integration verified via launch-token minting and demo session; external user acquisition in progress toward Week 5 snapshot gate."
}
```

Command used:

```bash
curl -H "Authorization: Bearer prod_key_demo" \
  https://platform-api-mu-henna.vercel.app/v1/apps/d0c2d586-b809-41c1-8751-e1d2621a1278/metrics
```

## Promotion channels

- Cohort PR (this submission)
- External learners via production URL (in progress)
- GCSE / IGCSE maths communities and study groups (planned)

## Agent usage

Cursor agent scaffolded the Next.js app, interactive geometry engine, Ludwitt
integration (launch JWT, session cookie, server-side events), 77-test vitest
suite including socket-level integration tests, platform-api with env-seeded
registration, and Vercel production deploys for both the app and reference API.

## Test plan

- [x] `npm test` — 77 tests pass (geometry sweep + integration stub platform)
- [x] `node scripts/check-answers.mjs` — 19/19 quiz answers verified
- [x] `npm run lint`, `npm run typecheck`, `npm run build`
- [x] Production deploy live at https://circle-lab.vercel.app
- [x] `/api/health` reports `platformConfigured: true`
- [x] Launch token minting via `scripts/launch-url.mjs`
- [x] Demo launch at `/launch?demo=1` sets session cookie and redirects to `/learn`
- [x] Platform API health reports `seeded: true` after redeploy
- [x] No secrets committed — all credentials in Vercel env vars

## Known limits

- Reference API store is in-memory; events reset on cold start (registrations
  persist via `SEED_*` env vars)
- User progress is per-browser (`localStorage`); platform holds events only
- Week 4 has no ≥25 user gate; that applies to Week 5 venture per program calendar
