# Project 1 Submission — @artira

Summer Pilot 2026, Project 1 — PM platform.

## Production URL

https://pm-artira-azure.vercel.app

Build repo: https://github.com/artira/pm-artira

## Setup steps verified on fresh clone

1. `git clone https://github.com/artira/pm-artira.git && cd pm-artira`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL Editor
4. Copy `.env.example` to `.env.local` with Supabase URL + anon key
5. `npm run dev` then sign up, create project, add tasks

## Architecture summary

- Frontend: Next.js 16 App Router + Tailwind CSS
- Auth: Supabase Auth (email/password)
- Database: Supabase Postgres with RLS on profiles, projects, tasks, comments, notifications
- Hosting: Vercel
- Triggers: auto-create profile on signup, auto-award points on task completion, auto-update timestamps

## Motivation / engagement design notes

- Points system: completing tasks awards 10/25/50 points based on priority
- Cohort leaderboard with progress bars showing relative standing
- Per-project progress bars with completion percentages and target date countdowns
- Dashboard with personal completion rate and overdue task count
- Due date badges with color-coded urgency
- In-app notifications for task assignments
- Drag-and-drop kanban board for quick status changes
- Comments on tasks for collaboration

## Known limitations

- No email notifications (in-app only)
- No GitHub issue/PR linking
- No review/vote module
- Dark mode follows system preference only (no manual toggle)
- No load testing performed

## Agent usage summary

- Research: Claude (claude.ai) — explored cohort repo structure, read requirements/rubric and peer submissions
- Development: Claude built the Next.js + Supabase app (auth, dashboard, projects, kanban board, leaderboard, notifications, schema with RLS + triggers)
- QA: Build verified locally, manual smoke test, deployed to Vercel