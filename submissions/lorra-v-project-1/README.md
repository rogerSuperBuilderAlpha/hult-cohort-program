# Mission Control — Cohort Civilization Tracker

Next.js + Supabase app for Phase 1 Project 1: projects, tasks, cohort civilization levels, energy, individual scores, and peer votes.

**Live:** https://REPLACE-WITH-YOUR-VERCEL-URL.vercel.app

> After deploying to Vercel, replace the URL above with your production hostname and keep it near the top of this README.

**Code path in the cohort monorepo:** `submissions/lorra-v-project-1/`

---

## Architecture

### Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** Auth (email/password) + Postgres with **Row Level Security**
- Server Actions for writes (no separate REST API layer)
- Deploy target: Vercel

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Cohort members (auto-created on signup) |
| `projects` | Named workstreams (`active` / `archived`); owned by creator |
| `tasks` | Kanban tasks; optional `project_id` + `assignee_id` |
| `pull_requests` | Submitted PRs for scoring |
| `contributions` | Non-PR contributions |
| `votes` | Peer votes — **one row per (voter, recipient)**; re-vote upserts |
| `mvp_status` | Single-row MVP gate inputs |
| `weekly_activity` | Weekly active check-ins |

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Public landing (redirects to dashboard when signed in) |
| `/dashboard` | Level, energy, civilization index, my tasks due this week |
| `/projects` | Create / edit / archive projects; task counts |
| `/tasks` | Kanban board with project + assignee + status filters |
| `/ascend` | Gate checklist |
| `/leaderboard` | Individual scores |
| `/profile/[id]` | Stats + cast/update peer vote |
| `/submit` | PR + contribution + weekly active |
| `/admin` | MVP status (write access: active project owners only) |
| `/login`, `/signup` | Email/password auth |

### RLS notes (v1.4)

- **Votes:** unique `(voter_id, recipient_id)`; app upserts so members can change their mind without stacking votes.
- **MVP status:** insert/update allowed only if the user owns at least one **active** `projects` row (simplification — no dedicated PM role).

---

## Setup

Run these steps from `submissions/lorra-v-project-1/` (this directory).

1. Create a Supabase project.
2. In the SQL editor, run migrations in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_tasks.sql`
   - `supabase/migrations/003_projects.sql`
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

---

## Scoring (implemented)

- Individual: `(merged×50 + contributions×20 + issues_resolved×15) × (1 + min(0.5, votes×0.05))`
- Level: gate table top-down (not the cosmetic index)
- Energy: recomputed from current rows; **+10 per `done` task** (gates unchanged)

## Flags for later (not expanded in v1)

1. **Daily active %** — schema only has `weekly_activity`; v1 uses weekly active % as the daily stand-in for Level 2/3 gates.
2. **Critical bug fixed (+100 energy)** — no event/history table; omitted from energy until logged.
3. **Feature delivered (+75)** — proxied by `e2e_flow_implemented` once.
4. **Anti-gaming / GitHub verification** — explicitly out of scope.
