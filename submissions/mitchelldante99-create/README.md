# Cohort PM Tool

Project management platform for the Hult Cohort Developer Program Summer Pilot 2026 — accounts, shared projects, tasks with assignments and a status workflow, plus motivation features (streaks, progress bars, leaderboard).

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres Auth (email/password) + Postgres database + Row Level Security + Realtime
- Deployed on Vercel

## Setup (fresh clone)

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and anon/publishable key (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then set up the database — in the Supabase SQL Editor, run, in order:
1. `supabase.sql` — creates tables, base RLS policies, and the new-user profile trigger
2. `supabase_migration_2.sql` — tightens RLS to creator/assignee-only writes, adds project archiving, and moves streak tracking into a server-side `complete_task()` function so clients can't self-report fake completions

Also disable email confirmation for instant signup: **Authentication → Providers → Email → "Confirm email" → off**.

```bash
npm run dev
```

## Data model
- `profiles` — one row per signed-up user: display name, streak, total tasks completed
- `projects` — shared cohort projects (`archived` flag to hide completed/retired ones)
- `tasks` — belongs to a project; status: `todo` / `in_progress` / `done`, priority, due date, assignee

## Deploying database changes
Run new SQL files directly in the Supabase SQL Editor, or via the Supabase CLI:
```bash
supabase db push
```
