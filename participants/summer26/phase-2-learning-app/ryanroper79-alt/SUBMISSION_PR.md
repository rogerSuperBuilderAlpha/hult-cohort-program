# P2-L1 PR body — @ryanroper79-alt

## Summary

Shipped **Climate Skills for Builders** — a Next.js learning app with three micro-lessons (carbon basics, green software, climate communications). Integrated with Ludwitt/Hult via JWT launch route (`/launch`) and server-side event proxy (`lesson_started`, `quiz_submitted`, `lesson_completed`).

## Ludwitt/Hult app ID

`b65605fa-d31d-4fdd-a993-295464c4baf5`

## Production listing URL

`https://site-nine-rouge-68.vercel.app/program/phase-2-learning-app` (cohort program directory — pending dedicated Ludwitt app listing when production API is live)

Production app deploy: **https://ryanroper79-alt.vercel.app**

Launch URL: **https://ryanroper79-alt.vercel.app/launch**

## Integration evidence (launch flow + events firing)

Smoke test output (`npm run smoke-test` against local Ludwitt API + app):

- `POST /v1/auth/launch-token` → redirect to `/launch?token=…`
- Session cookie `climate_learn_session` set on redirect
- `lesson_started` on launch; `quiz_submitted` via `/api/events`
- Metrics: `qualified_users: 1` for external test user `external-smoke-user-1`

## Agent usage

- Research: Ludwitt integration spec, local `execution/ludwitt-hult-api`, cohort PR template
- Dev: Next.js app, JWT launch route handler, event proxy, register/smoke scripts
- QA: `npm run typecheck`, `npm run build`, `npm run smoke-test` (pass)

## Test plan

- [ ] Open production `/launch?token=…` from platform launcher
- [ ] Complete one lesson quiz; confirm non-heartbeat event in platform metrics
- [ ] Fresh clone: `npm install`, copy `.env.example`, `npm run build`
