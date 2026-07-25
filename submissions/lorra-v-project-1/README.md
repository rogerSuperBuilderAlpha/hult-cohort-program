# Mission Control — Cohort Civilization Tracker

**Live app:** https://mission-control-sandy-phi.vercel.app/

A project management platform for the Hult Cohort Developer Program, built to track work, deadlines, and motivation. Real project/task tracking is paired with a Kardashev-inspired progression system — the cohort collectively advances through civilization levels based on actual merged PRs, contributions, MVP progress, and adoption.

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS 4 · Supabase (Postgres, Auth, Row Level Security) · deployed on Vercel

**Database tables:**
- `profiles` — cohort member accounts (extends Supabase `auth.users`)
- `projects` — projects created/owned by cohort members, with `active`/`archived` status
- `tasks` — title, description, status (`todo` / `in_progress` / `blocked` / `done`), assignee, due date, optional `project_id`
- `pull_requests` — self-linked GitHub PRs
- `contributions` — non-PR contributions (docs, design, PM tasks)
- `votes` — peer votes on profiles, one per voter/recipient pair
- `mvp_status` — manually tracked feature completion % and open critical bugs
- `weekly_activity` — per-member weekly activity for adoption metrics

**UI shell (authenticated pages):**
- Persistent header: sidebar toggle, Civilization Index + progress bar (center), profile avatar (right)
- Collapsible sidebar: navigation, a "Civilization Quotes" control that cycles a rotating quote in a muted sidebar card, and profile/logout at the bottom
- Pinned open on desktop (`md+`); overlay drawer on smaller screens

**Pages:**
- `/` — public landing page (unauthenticated); full-bleed hero video with `prefers-reduced-motion` still-image fallback; signed-in users redirect to `/dashboard`
- `/login`, `/signup` — Supabase email/password auth
- `/dashboard` — cohort level + civilization energy; side-by-side "My tasks due this week" and next-tier progress gates (Civilization Index lives in the header)
- `/ascend` — full gate checklist for the next civilization level
- `/projects` — project list; create/edit/archive via modal; titles shown with an accent chip
- `/tasks` — kanban board with project / assignee / status filters; create via modal
- `/leaderboard` — individual score ranking over a spiral-galaxy background
- `/profile/[id]` — individual profile, PRs/contributions, peer voting
- `/submit` — log a PR or contribution
- `/admin` — MVP status editing (write access limited to owners of an active project)

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

## Assets

| File | Used on |
|------|---------|
| `public/videos/hero-video.mp4` | Landing page hero (autoplay, muted, loop) |
| `public/images/galaxy-hero.png` | Landing poster / reduced-motion fallback |
| `public/images/spiral-galaxy-leaderboard.png` | Leaderboard background |

Generated with Magnific and Envato from ChatGPT-authored prompts.

## Known limitations

- PR and contribution data is self-reported; there's no GitHub API verification in v1.
- The daily-active-% gate currently reuses the weekly-active-% figure (no separate daily tracking table yet), which can make the daily gate easier to clear than intended.
- "Critical bug fixed" is not yet wired into the Civilization Energy total (no bug-event history table).
- "Feature delivered" energy is proxied via a single end-to-end-flow checkbox rather than per-feature tracking.
- No anti-gaming guardrails on peer voting beyond one vote per voter/recipient pair (no minimum-activity requirement to vote).
- `mvp_status` write access is currently restricted to project owners rather than a dedicated admin role, since no separate roles system exists yet.

## Agent usage

Claude was used throughout as a design/architecture collaborator: reviewing the initial concept, resolving open scoring-model questions (data source, vote integration, individual vs. cohort scoring, gate table vs. formula), and producing scoped build prompts executed in Cursor for the base platform, the task/deadline layer, the Projects entity, and the public landing page. Later Cursor sessions added the authenticated AppShell (header + collapsible sidebar + civilization quotes), modal create flows for projects/tasks, and the leaderboard galaxy background. Claude was also used for git and Vercel deployment troubleshooting (environment variable key format, monorepo root directory misconfiguration, framework preset mismatch on the live deployment).
