# Project 1 Submission — @r3s0lv343vr

Summer Pilot 2026, Project 1 — PM platform (Phase 1).

## Production URL

https://pm-r3s0lv343vr.vercel.app

Build repo: https://github.com/r3s0lv343vr/pm-r3s0lv343vr (`main`)

Historical Cloud Agent branch (kept, not deleted): https://github.com/r3s0lv343vr/pitch-rise-verification/tree/agent/pm-platform-phase1-continued

Supabase project: `pm-r3s0lv343vr` (`uahrzlkpjkbttubnnypv`) — schema synced, seeded, Vercel env configured (`DATABASE_URL` = **Transaction pooler :6543**, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).

Demo logins (password `password123`): `pm@hult-cohort.test`, `admin@hult-cohort.test`, `member@hult-cohort.test`, `staff-review@hult-cohort.test`.

## Setup steps verified on a fresh clone

1. `git clone https://github.com/r3s0lv343vr/pm-r3s0lv343vr.git && cd pm-r3s0lv343vr`
2. `cp .env.example .env` and set `DATABASE_URL` (Postgres Transaction pooler on Vercel), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
3. `npm install`
4. `npx prisma migrate deploy` (or `npx prisma db push` if schema is ahead of migration history)
5. `npm run db:seed`
6. `npm run build` (verified)
7. `npm run dev` or `npm start` → sign in with a seeded account
8. Production: Vercel project `pm-r3s0lv343vr` with the same env vars; login + `/reports` smoke-tested on the production URL

## Architecture summary

- **App:** Next.js 15 App Router + Tailwind
- **Auth:** Auth.js (NextAuth) credentials / JWT sessions; roles Admin / PM / Member / Viewer
- **Data:** Prisma + PostgreSQL (Supabase **Transaction** pooler `:6543` + `pgbouncer=true` in production; Session/direct URL only for migrations when needed)
- **Mutations:** Server Actions
- **Hosting:** Vercel
- **Phase 1 surfaces:** Command Center (Overview / Kanban / Process Map / Gantt), My Work (clock + assignments), Projects (budget/risks/map), Reports with **Trend Analysis** + **Insights** (workload, dependency impact, resource reallocation, budget/time/risk charts)

```
User → Next.js (App Router)
     → Auth.js session (credentials)
     → Server Actions / RSC data loaders
     → Prisma → Supabase Postgres
     → Vercel production alias
```

## Motivation / engagement design notes

- **Always-visible next action:** My Work and Overview push blockers, overdue work, and high-impact tasks first.
- **Process clarity:** Swimlane process map + linked status model so classmates see where work sits in Discover → Build → Approve.
- **Report storytelling:** Insights rollup (progress, owner/team, budget, risks, solutions deck) plus Trend Analysis (planned vs actual schedule, burn forecast, cost-by-phase) for standup-ready review.
- **Capacity moves:** Team Resource Allocation highlights people finished in one process area who can reinforce struggling stages.
- **Low-friction review:** Open signup + seeded demo accounts so peers/staff can enter without a private invite chain.

## Known limitations

- Integration connect toggles are disclosed non-functional stubs (not live third-party sync; local Connected flag only).
- No native mobile app; email reminders not shipped.
- Canonical source is `r3s0lv343vr/pm-r3s0lv343vr` (`main`); earlier work remains on `pitch-rise-verification` branch `agent/pm-platform-phase1-continued` for history.
- Some analytics (burn/schedule curves) are derived from task dates/status burn ratios rather than a full historical cost ledger.
- **Phase 1 scope only.** Phase 2 expects ticketing plus a sandbox to test changes and stress-test project/budget impacts before/as work proceeds, to limit further risk and budget overshoot. Phase 3 expects AI and forecasting capabilities; some Phase 3 work may run concurrently with Phase 2. Hoping to complete those by Sunday.
- I'd like to present.

## Agent usage summary

- **Research:** Hult Project 1 PM requirements, cohort submission format, Vercel + Supabase deploy path
- **Development:** Cursor agent built the Phase 1 PM platform (auth, RBAC, Command Center, My Work, budgets/risks, Reports Insights + Trend Analysis, seed of ~33 users), deployed to Vercel against Supabase, and prepared this cohort submission PR
- **QA:** Local production smoke, fresh-clone install/build path, production URL login + reports routes verified (`https://pm-r3s0lv343vr.vercel.app`)
