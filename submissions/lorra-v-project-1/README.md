# Mission Control — Cohort Civilization Tracker

**Live app:** https://mission-control-sandy-phi.vercel.app/

A project management platform for the Hult Cohort Developer Program, built to track work, deadlines, and motivation. Real project/task tracking is paired with a Kardashev-inspired progression system — the cohort collectively advances through civilization levels based on actual merged PRs, contributions, MVP progress, and adoption.

## Architecture

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, Row Level Security) · deployed on Vercel

**Database tables:**
- `profiles` — cohort member accounts (extends Supabase `auth.users`)
- `projects` — projects created/owned by cohort members, with `active`/`archived` status
- `tasks` — title, description, status (`todo` / `in_progress` / `blocked` / `done`), assignee, due date, optional `project_id`
- `pull_requests` — self-linked GitHub PRs
- `contributions` — non-PR contributions (docs, design, PM tasks)
- `votes` — peer votes on profiles, one per voter/recipient pair
- `mvp_status` — manually tracked feature completion % and open critical bugs
- `weekly_activity` — per-member weekly activity for adoption metrics

**Pages:**
- `/` — public landing page (unauthenticated)
- `/dashboard` — cohort level, civilization energy, index progress, "due this week" tasks
- `/ascend` — full gate checklist showing what's needed for the next civilization level
- `/projects` — project list, create/archive
- `/tasks` — kanban task board, filterable by project, assignee, and status
- `/leaderboard` — individual score ranking
- `/profile/[id]` — individual profile, PRs/contributions, voting
- `/submit` — log a PR or contribution
- `/admin` — MVP status editing

## Setup (fresh clone)

1. Create a Supabase project.
2. In the Supabase SQL Editor, run the migrations in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_tasks.sql`
   - `supabase/migrations/003_projects.sql`
3. Copy the environment template and fill in your project's values:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the Publishable key, if your Supabase project uses the new API key format).
4. Install and run:
   ```bash
   cd submissions/lorra-v-project-1
   npm install
   npm run dev
   ```
5. Visit `localhost:3000`, sign up, and you'll land on the Dashboard.

## Motivation / engagement design

- **Civilization Level** (Pre-Level 1 → Builder → Stellar → Galactic) is determined by a fixed, transparent gate table — merged PRs, unique contributors, MVP completion, weekly/daily adoption — not a hidden score. The `/ascend` page shows exactly which gates are and aren't met.
- **Civilization Energy** is an always-increasing counter that rewards merged PRs, reviews, contributions, adoption, and completed tasks — a running record of collective output that never resets.
- **Civilization Index** is a cosmetic 0–100% progress bar toward the next level. It never overrides the gate table for actual level-ups — it's a momentum indicator only.
- **Individual leaderboard score** is boosted by a capped peer-vote multiplier, so votes amplify real output rather than substituting for it.
- **Task board** ties the motivation layer back to real work — tasks belong to projects, have due dates with overdue/near-due highlighting, and completing one contributes a small amount of energy.

## Known limitations

- PR and contribution data is self-reported; there's no GitHub API verification in v1.
- The daily-active-% gate currently reuses the weekly-active-% figure (no separate daily tracking table yet), which can make the daily gate easier to clear than intended.
- "Critical bug fixed" is not yet wired into the Civilization Energy total (no bug-event history table).
- "Feature delivered" energy is proxied via a single end-to-end-flow checkbox rather than per-feature tracking.
- No anti-gaming guardrails on peer voting beyond one vote per voter/recipient pair (no minimum-activity requirement to vote).
- `mvp_status` write access is currently restricted to project owners rather than a dedicated admin role, since no separate roles system exists yet.

## Agent usage

Claude was used throughout as a design/architecture collaborator: reviewing the initial concept, resolving open scoring-model questions (data source, vote integration, individual vs. cohort scoring, gate table vs. formula), and producing scoped build prompts executed in Cursor for the base platform, the task/deadline layer, the Projects entity, and the public landing page. Claude was also used for git and Vercel deployment troubleshooting (environment variable key format, monorepo root directory misconfiguration, framework preset mismatch on the live deployment).
