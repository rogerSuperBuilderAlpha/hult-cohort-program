# Project 1 Submission — @joes9987

Summer Pilot 2026, Project 1 — **EudaPM** (cohort project management platform).

## Production URL

https://pm-joes9987.vercel.app

Build repo: https://github.com/joes9987/pm-joes9987

Supabase project: `pm-joes9987` (`vidprovlxevofniwyhgs`) — schema applied, Vercel env configured, Edge Functions deployed, pg_cron scheduled.

## Setup steps verified on fresh clone

1. `git clone https://github.com/joes9987/pm-joes9987.git && cd pm-joes9987`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL editor (fresh install) or apply migrations in `supabase/migrations/`
4. Copy `.env.example` → `.env.local` with Supabase URL + anon key
5. `npm run dev` → sign up, create project on **Projects**, create + assign task with due date on **Dashboard**
6. Edit project name/description and reassign tasks after creation
7. Production deployed to Vercel with env vars set

**Email digests (optional infra):** See build repo `docs/BREVO_EMAIL_SETUP.md` for Brevo sender verification, Edge Function secrets, and cron schedule. Reviewers do not need this to use the app.

## Architecture summary

- **Product:** EudaPM — tasks, deadlines, comments, search, soft-delete, points/leaderboard
- **Frontend:** Next.js 16 App Router + Tailwind CSS (Syne + IBM Plex)
- **Auth:** Supabase Auth (email/password, cookie sessions via `@supabase/ssr`)
- **Database:** Supabase Postgres with RLS on profiles, projects, tasks, task_comments, notifications, point_events
- **Realtime:** Live TaskBoard, notifications, comments, leaderboard
- **Hosting:** Vercel (`pm-joes9987.vercel.app`)
- **Email:** Edge Functions `send-deadline-reminders` + `send-leaderboard-kudos` via Brevo

## Motivation / engagement design notes

- **Cohort-first framing:** Built for 30+ daily users coordinating deliverables across a 14-week cohort.
- **Deadline visibility:** Task due dates with urgency badges and quick filters.
- **In-app + email nudges:** Notification bell (Realtime) and daily Brevo digests.
- **Difficulty + leaderboard:** Low/Mid/High points; Progress page leaderboard; weekly kudos email.
- **Collaboration depth:** Global search, task comments, soft-delete/restore, profile display names.
- **Live sync:** Status/assignment changes appear for other users without refresh.
- **Archive / soft-delete:** Projects archive; tasks soft-delete to preserve history.

## Demo script

1. Sign in → Dashboard shows task list first; create form behind **Create task**
2. Create a task with due date and assignee → assignee gets a notification
3. Open **Search** → find the task by title
4. Expand **Comments** on a task → post a note
5. Soft-delete a task → toggle **Show deleted** → Restore
6. Open **Settings** → change display name → header updates
7. Mark task done → points update on **Progress** leaderboard
8. *(Optional)* Two browsers: change status in A → appears live in B

## Known limitations

- Email digests require Brevo + Edge Function secrets (reviewers can skip)
- No GitHub issue linking, review/vote module, invite-only signup, or Kanban yet
- Email confirmation should remain disabled for frictionless reviewer signup

## Agent usage summary

- **Research:** Phase 1 requirements, submission format, cohort template conventions
- **Development:** Cursor Agent scaffolded Next.js app, Supabase schema + RLS, auth, project/task UI, motivation features, Brevo digests, gamification, and EudaPM product pass (rebrand, theme, search, comments, soft-delete, settings, live sync)
- **QA:** Production smoke tests, Supabase linked, auth and digest sends verified
