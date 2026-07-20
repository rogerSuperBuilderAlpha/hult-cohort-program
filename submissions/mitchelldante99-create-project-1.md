# Project 1 Submission — @mitchelldante99-create

Summer Pilot 2026, Project 1 — multi-user PM platform for the cohort.

## Production URL

https://pm-tool-eight-psi.vercel.app/

## Build repo

Source lives in this monorepo at [`submissions/mitchelldante99-create/`](./mitchelldante99-create/).

## Setup steps verified on fresh clone

1. `npm install`
2. `cp .env.example .env.local` and fill in the Supabase project URL + anon key
3. Run `supabase.sql`, then `supabase_migration_2.sql`, then `supabase_migration_3.sql` in the Supabase SQL Editor, in that order
4. Disable "Confirm email" under Authentication → Providers → Email (for instant signup)
5. `npm run dev`

`npm run build` and lint pass cleanly; signup, login, project creation with member selection, task creation/assignment, status transitions, archive/delete, and cross-account visibility verified on the live deployment.

## Architecture summary

Next.js (App Router) + TypeScript + Tailwind. Supabase backend: Postgres Auth (email/password), tables (`profiles`, `projects`, `project_members`, `tasks`) with Row Level Security, and Supabase Realtime for live updates. Streak tracking runs through a server-side `complete_task()` Postgres function so completions can't be self-reported.

## Motivation / engagement design notes

- Live progress bars per project
- Personal completion streaks (consecutive days with a completed task), tracked server-side to prevent gaming
- Cohort-wide leaderboard ranked by tasks completed
- Light/dark mode toggle

## Known limitations

- Any signed-in cohort member can edit or delete any project/task (open collaboration model, chosen deliberately for this small trusted cohort)
- No email verification on signup
- No task editing after creation (only status changes and deletion)
- Project membership is optional/advisory: with no members picked, task assignment stays open to the whole cohort

## Agent usage summary

Built with Claude — scaffolded the app, migrated the backend from an initial Firebase build to Supabase after ad-blocker/network compatibility issues, hardened the data layer against a race condition that hid tasks for some accounts, and implemented project membership, open permissions, archive/delete, and light/dark mode from review feedback.

---

*Re-filed against `projects/summer26/phase-1-project-1` so this submission appears on the peer review list. Original submission: [#39](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/39) (merged to `main`).*
