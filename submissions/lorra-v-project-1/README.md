# Mission Control — Cohort Civilization Tracker (v1)

Next.js + Supabase app for Phase 1 Project 1: cohort civilization levels, energy, individual scores, and peer votes.

## Setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/001_schema.sql`.
3. Copy env:

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Enable Email auth in Supabase (Authentication → Providers → Email). Disable “Confirm email” for local testing if you want instant login.
5. Install and run:

```bash
npm install
npm run dev
```

6. Sign up ~10 test users via `/signup`, then optionally paste real profile UUIDs into `supabase/seed.sql` and run the commented inserts.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard: level, energy, civilization index, my tasks due this week |
| `/ascend` | Gate checklist |
| `/tasks` | Kanban task board (v1.1) |
| `/leaderboard` | Individual scores |
| `/profile/[id]` | Stats + vote |
| `/submit` | PR + contribution + weekly active |
| `/admin` | Manual MVP status |
| `/login`, `/signup` | Email/password auth |

## Scoring (implemented)

- Individual: `(merged×50 + contributions×20 + issues_resolved×15) × (1 + min(0.5, votes×0.05))`
- Level: gate table top-down (not the cosmetic index)
- Energy: recomputed from current rows; **+10 per `done` task** (v1.1; gates unchanged)

## v1.1 tasks

Run `supabase/migrations/002_tasks.sql` after the base schema. Tasks do not affect gate metrics.

## Flags for later (not expanded in v1)

1. **Daily active %** — schema only has `weekly_activity`; v1 uses weekly active % as the daily stand-in for Level 2/3 gates.
2. **Critical bug fixed (+100 energy)** — no event/history table; omitted from energy until logged.
3. **Feature delivered (+75)** — proxied by `e2e_flow_implemented` once.
4. **Anti-gaming / GitHub verification** — explicitly out of scope.
