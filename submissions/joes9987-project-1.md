# Project 1 Submission — @joes9987

Summer Pilot 2026, Project 1 — PM platform.

## Production URL

https://pm-joes9987.vercel.app

Build repo: https://github.com/joes9987/pm-joes9987

Supabase project: `pm-joes9987` (`vidprovlxevofniwyhgs`) — schema applied, Vercel env configured.

## Setup steps verified on fresh clone

1. `git clone https://github.com/joes9987/pm-joes9987.git && cd pm-joes9987`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL editor (fresh install) or `supabase/migrations/20260715_motivation_features.sql` (upgrade)
4. Copy `.env.example` → `.env.local` with Supabase URL + anon key
5. `npm run dev` → sign up, create project on **Projects**, create + assign task with due date on **Dashboard**
6. Production deployed to Vercel with env vars set

## Architecture summary

- **Frontend:** Next.js 16 App Router + Tailwind CSS v4
- **Auth:** Supabase Auth (email/password, cookie sessions via `@supabase/ssr`)
- **Database:** Supabase Postgres with RLS on `profiles`, `projects`, `tasks`, `notifications`
- **Hosting:** Vercel (production alias `pm-joes9987.vercel.app`)
- **Theming:** `next-themes` — system preference default, manual light/dark toggle

```
User → Next.js pages/components
     → Supabase Auth (session cookies)
     → Postgres (profiles, projects, tasks, notifications)
     → RLS policies + DB triggers (assignment/completion notifications)
```

## Motivation / engagement design notes

- **Cohort-first framing:** Landing copy targets 30+ daily users coordinating eight deliverables — not a generic todo app.
- **Low-friction onboarding:** Open email/password signup so reviewers and staff can create accounts without builder assistance.
- **Deadline visibility:** Optional task due dates with color-coded urgency badges and quick filters (My tasks, Overdue, Due this week).
- **In-app nudges:** Notification bell for assignments, due-soon/overdue tasks, and completed tasks (for task creators).
- **Progress feedback:** Dashboard motivation panel (Focus today, completion rate, on-time rate) and `/progress` page with per-project metrics.
- **Project goals:** Optional `target_date` on projects with countdown on Projects and Progress pages.
- **Visible filters:** Task board filters by project, status, assignee, plus motivation quick filters.
- **Archive, not delete:** Projects archive instead of hard-delete to preserve history during operator cutover.
- **Guided empty states:** Dashboard prompts users to create a project first when the project dropdown would otherwise be empty.

## Demo script (motivation features)

1. User A creates a project with a target deadline on **Projects**
2. User A creates a task assigned to User B with due date tomorrow on **Dashboard**
3. User B sees assignment notification in the bell icon
4. Set a task due date in the past → overdue badge + Focus today widget updates
5. Mark task done → completion message + on-time rate updates on dashboard
6. Open **Progress** → see project completion bar and overdue count

## Known limitations

- Email digest reminders documented for Phase 2 (`docs/PHASE2_EMAIL_REMINDERS.md`) — in-app notifications ship in Phase 1
- No GitHub issue linking yet
- No review/vote module (differentiator backlog for later projects)
- Email confirmation should remain disabled in Supabase Auth for frictionless reviewer signup during review week

## Agent usage summary

- **Research:** Phase 1 requirements, submission format, cohort template conventions
- **Development:** Cursor Agent scaffolded Next.js app, Supabase schema + RLS, auth flows, project/task UI, motivation features (due dates, notifications, progress metrics), Vercel deploy, UI polish
- **QA:** Production URL smoke test (200), Supabase linked, signup/auth verified on production, fresh-clone setup checklist in README
