# Project 1 Submission — @joes9987

Summer Pilot 2026, Project 1 — **EudaPM** (cohort project management platform).

## Production URL

https://pm-joes9987.vercel.app

Build repo: https://github.com/joes9987/pm-joes9987

Supabase project: `pm-joes9987` (`vidprovlxevofniwyhgs`) — schema applied, Vercel env configured, Edge Functions deployed, pg_cron scheduled.

## Setup steps verified on fresh clone

1. `git clone https://github.com/joes9987/pm-joes9987.git && cd pm-joes9987`
2. `npm install` (Windows dev: optional dep `lightningcss-win32-x64-msvc` included in lockfile)
3. Run `supabase/schema.sql` in Supabase SQL editor (fresh install) or apply migrations in `supabase/migrations/`
4. Copy `.env.example` → `.env.local` with Supabase URL + anon key
5. `npm run dev` → visit `/` for marketing home → **Get started** → sign up → create project on **Projects**, task on **Dashboard**
6. Edit project name/description and reassign tasks after creation
7. Production deployed to Vercel with env vars set

**Email digests (optional infra):** See build repo `docs/BREVO_EMAIL_SETUP.md` for Brevo sender verification, Edge Function secrets, and cron schedule. Reviewers do not need this to use the app.

## Architecture summary

- **Product:** EudaPM — public marketing home, auth (signup / sign-in / forgot password), tasks, deadlines, comments, search, soft-delete, points/leaderboard, GitHub repo tracking
- **Brand:** Eudaimonia-inspired identity — laurel-sprig SVG logo (headers + favicon), hero illustration, themed empty-state artwork; all theme-aware via CSS variables (light/dark)
- **Frontend:** Next.js 16 App Router + Tailwind CSS (Syne + IBM Plex, Studio Neon Soft theme)
- **Auth:** Supabase Auth (email/password, cookie sessions via `@supabase/ssr`); password reset via `/forgot-password` → email link → `/auth/confirm` → `/reset-password`
- **Database:** Supabase Postgres with RLS on profiles, projects, tasks, task_comments, notifications, point_events
- **Realtime:** Live TaskBoard, notifications, comments, leaderboard (unique channel per subscription)
- **GitHub integration:** Projects can link a public repo (`owner/repo` or URL, normalized on save); server route `/api/github/activity` fetches commits + PRs/issues from the GitHub REST API with a 5-minute cache (optional `GITHUB_TOKEN` env raises the rate limit); feed renders on Projects rows and a Dashboard card
- **Hosting:** Vercel (`pm-joes9987.vercel.app`)
- **Email:** Edge Functions `send-deadline-reminders` + `send-leaderboard-kudos` via Brevo (sender name **EudaPM**)

## Motivation / engagement design notes

- **Public home page:** Anonymous visitors land on `/` with purpose copy, feature groups (Work / Collaborate / Momentum), how-it-works steps, and Sign up / Sign in CTAs; signed-in users redirect to Dashboard
- **Cohort-first framing:** Built for 30+ daily users coordinating deliverables across a 14-week cohort
- **Deadline visibility:** Task due dates with urgency badges and quick filters
- **In-app + email nudges:** Notification bell (Realtime) and daily Brevo digests
- **Difficulty + leaderboard:** Low/Mid/High points; Progress page leaderboard; weekly kudos email
- **Collaboration depth:** Global search, task comments, soft-delete/restore, profile display names
- **Live sync:** Status/assignment changes appear for other users without refresh
- **Account recovery:** Forgot-password email flow for cohort self-service
- **Repo visibility:** Linked GitHub repos surface commits/PRs/issues in-app so the whole group sees build momentum alongside tasks
- **Visual identity:** Laurel-sprig logo and flourishing illustrations (eudaimonia concept) make the workspace feel alive, including friendly empty states

## Demo script

1. Visit **/** (signed out) → scroll marketing home: purpose, features, how-it-works → **Get started**
2. Sign up → Dashboard shows task list first; create form behind **Create task**
3. Create a task with due date and assignee → assignee gets a notification
4. Open **Search** → find the task by title
5. Expand **Comments** on a task → post a note
6. Soft-delete a task → toggle **Show deleted** → Restore
7. Open **Settings** → change display name → header updates
8. Mark task done → points update on **Progress** leaderboard
9. On **Projects** → Edit → link a GitHub repo (e.g. `joes9987/pm-joes9987`) → **Activity** expands live commit/PR feed; Dashboard gains a **Repo activity** card
10. Sign out → **Forgot password?** on login → reset email → set new password
11. *(Optional)* Two browsers: change status in A → appears live in B

## Known limitations

- Email digests require Brevo + Edge Function secrets (reviewers can skip)
- GitHub tracking is read-only for public repos (polling with 5-min cache; no webhooks or issue-to-task linking); no review/vote module, invite-only signup, or Kanban yet
- Email confirmation should remain disabled for frictionless reviewer signup
- AdGuard or similar browser extensions may log harmless CSS parse noise on the landing page

## Agent usage summary

- **Research:** Phase 1 requirements, submission format, cohort template conventions
- **Development:** Cursor Agent scaffolded Next.js app, Supabase schema + RLS, auth (including password reset), project/task UI, motivation features, Brevo digests, gamification, EudaPM product pass (rebrand, theme, search, comments, soft-delete, settings, live sync), public marketing home page, eudaimonia brand identity (SVG logo + illustrations), and GitHub repo tracking
- **QA:** Production smoke tests, Supabase linked, auth and digest sends verified, Realtime subscription stability fix deployed, GitHub feed verified end-to-end on production
