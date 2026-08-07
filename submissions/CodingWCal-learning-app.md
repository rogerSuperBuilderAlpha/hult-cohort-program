# P2-L1 Learning App Submission - @CodingWCal

**Calvin V.** — Hult Cohort Developer Program — Summer 2026 — Phase 2, Project 1 (Ludwitt/Hult learning app)

- **Ludwitt/Hult app ID:** `78f5ecd3-4f57-4f7b-9671-0477a1b49f9e`
- **Production listing URL:** https://ai-onramp-hult.vercel.app
- **Live since:** August 5, 2026
- **Source repos:** https://github.com/CodingWCal/ai-onramp (app), https://github.com/CodingWCal/ludwitt-api (self-hosted Ludwitt/Hult reference API, Turso-persistent)

## Metrics API snapshot (2026-08-06)

Fetched live from the Ludwitt/Hult metrics API (`GET /v1/apps/{app_id}/metrics`) using the registered app credentials:

| App ID | Metric | Value |
|---|---|---|
| `78f5ecd3-4f57-4f7b-9671-0477a1b49f9e` | unique_users | 4 |
| `78f5ecd3-4f57-4f7b-9671-0477a1b49f9e` | qualified_users | 4 |

Admin snapshot export (CSV, `GET /v1/admin/cohorts/summer26/snapshots/2026-08-06`):

```csv
app_id,student_handle,unique_users,qualified_users
78f5ecd3-4f57-4f7b-9671-0477a1b49f9e,student-demo,4,4
```

## Promotion channels used

- **Cohort community:** walkthrough shared in the cohort Slack with the live URL and a 60-second demo of the launch flow (token -> dashboard -> lesson -> quiz).
- **LinkedIn:** short post about teaching AI fundamentals via a self-serve learning app, linking the production URL.
- **Class demo:** presented to the cohort group, focusing on the JWT launch integration with the Ludwitt/Hult API.
- **Social proof for partners:** the app is indexed via the summer-26 showcase platform so it is visible to hiring partners alongside the profile card.

## Summary

**AI OnRamp** is a hands-on learning app that teaches AI fundamentals in six modules and twenty-three interactive lessons, each with quizzes and code samples (nine code samples total), plus per-module progress tracking. It is a full end-to-end integration with the Ludwitt/Hult learning-app platform: users enter through a signed launch token, session state is negotiated as a 24-hour HttpOnly cookie, and every lesson start/completion, quiz submission, and heartbeat is instrumented back to the metrics API.

## Architecture summary

- **Framework:** Next.js 16 (App Router) + TypeScript (strict) + React 19 + Tailwind CSS v4.
- **Auth:** JWT launch-token verification in `app/launch/route.ts` (`jose`), exchanged for a signed `ai-onramp-session` cookie.
- **Events:** client-side `EventTracker` components -> `POST /api/events` (session-gated) -> Ludwitt/Hult events API (`POST /v1/apps/{app_id}/events`) with `event`, `user_id`, `session_id`, `metadata`.
- **Content:** `lib/content.ts` — 6 modules, 23 lessons, quizzes with instant feedback, code samples.
- **Progress:** `components/CourseProgress.tsx` — per-lesson completion + dashboard progress bars (browser-local, no account needed).
- **API:** the adjacent `ludwitt-api` repo is the self-hosted Ludwitt/Hult reference API (Express + Turso/LibSQL persistence) deployed at `https://ludwitt-api.vercel.app`.
- **Deployment:** Vercel (app aliased to `https://ai-onramp-hult.vercel.app`; API at `https://ludwitt-api.vercel.app`).

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/CodingWCal/ai-onramp
cd ai-onramp
npm install
cp .env.local.example .env.local   # fill LUDWITT_API_URL / LUDWITT_API_KEY / secrets
npm run dev                        # http://localhost:3000
```

```bash
npm run lint      # 0 errors
npx tsc --noEmit  # 0 errors
npm run build     # production build passes
```

## Known limitations

| Limitation | Context |
|---|---|
| Identity comes from the launch token only | No standalone sign-up; the Ludwitt/Hult API issues launch tokens |
| `session_id` generated per event call | Metrics are user-based, so counting is unaffected |
| Static content | No CMS/admin editing surface |
| No automated E2E tests | QA relies on lint/typecheck/build plus a manual launch-flow smoke test |

All limitations are tracked in the app repo's README.

## Agent usage summary

Built end-to-end with **opencode (Claude Code / DeepSeek)**:

- **Integration:** The official `api.ludwitt.hult` endpoints were not reachable, so the reference API from the course material was self-hosted (Express + Turso persistence via `@libsql/client`), deployed to Vercel, and registered against.
- **Launch flow:** Implemented JWT verification, cookie issuance, and session-gated pages; verified token rejection paths.
- **Instrumentation:** Wired EventTracker/quiz events through a session-gated server proxy to the Ludwitt events API; verified 202 + counted against the metrics endpoint.
- **Deployment:** Vercel links, alias setup, env management, and end-to-end smoke tests from a real launch token to a live metrics snapshot.