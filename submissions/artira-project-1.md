# Project 1 Submission — @artira

Summer Pilot 2026, Project 1 — PM platform.

## Production URL

https://pm-artira-azure.vercel.app

Build repo: https://github.com/artira/pm-artira

Demo login: `sofia.martinez@demo.cohort` / `demo1234` (project owner, top scorer)

## Setup steps verified on fresh clone

1. `git clone https://github.com/artira/pm-artira.git && cd pm-artira`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL Editor
4. Copy `.env.example` to `.env.local` with Supabase URL + anon key
5. (Optional) Seed demo data: `SUPABASE_SERVICE_ROLE_KEY=your-key node supabase/seed.mjs`
6. `npm run dev` then sign up or use a demo account

## Architecture summary

- Frontend: Next.js 16 App Router + Tailwind CSS
- Auth: Supabase Auth (email/password)
- Database: Supabase Postgres with RLS on profiles, projects, tasks, comments, notifications
- Hosting: Vercel
- Triggers: auto-create profile on signup, auto-award points on task completion, auto-update timestamps
- Permissions: project owners have full CRUD; assignees can update status only; everyone else is read-only

## Motivation / engagement design notes

- Points system: completing tasks awards 10/25/50 points based on priority (low/medium/high)
- Leaderboard with podium — gold/silver/bronze medals for top 3, progress bars for all
- Dashboard with gradient hero banner, SVG donut chart (task status), priority bar chart, cohort-wide stacked progress bar
- Vivid color palette: purple, teal, pink, orange gradients throughout
- In-app notifications for task assignments
- Due date badges with color-coded urgency (overdue = red, due soon = orange)
- Per-project progress bars with completion percentages and deadline countdowns
- Dark mode toggle: System / Light / Dark (persisted in localStorage)
- Role-based UI: project owners see full management controls; assignees see status-only controls; read-only users see clean task cards
- 10 demo users seeded with realistic tasks, comments, and varied point totals for a live demo

## Known limitations

- No email notifications (in-app only)
- No GitHub issue/PR linking
- No review/vote module
- No load testing performed

## Agent usage summary

- Research: Claude (claude.ai) — explored cohort repo structure, read requirements/rubric and peer submissions, identified baseline and differentiating features
- Development: Claude built the full Next.js + Supabase app including auth, dashboard with charts, projects page, kanban board with role-based permissions, podium leaderboard, notifications, dark mode toggle, vivid color system, database schema with RLS policies and triggers, and seed script for demo data
- QA: Build verified locally (`npm run build` clean), manual smoke test (signup, create project, create/assign tasks, drag-and-drop status changes, leaderboard updates, role switching between owner and assignee accounts), deployed to Vercel, seed script verified with 10 users + 30 tasks
