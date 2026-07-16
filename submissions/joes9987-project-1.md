# Project 1 Submission — @joes9987

Summer Pilot 2026, Project 1 — PM platform.

## Production URL

https://pm-joes9987.vercel.app

Build repo: https://github.com/joes9987/pm-joes9987

Supabase project: `pm-joes9987` (`vidprovlxevofniwyhgs`) — schema applied, Vercel env configured, Edge Function deployed, pg_cron scheduled.

## Setup steps verified on fresh clone

1. `git clone https://github.com/joes9987/pm-joes9987.git && cd pm-joes9987`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL editor (fresh install) or apply migrations:
   - `supabase/migrations/20260715_motivation_features.sql` (due dates, notifications)
   - `supabase/migrations/20260715_email_digest_brevo.sql` (email digest idempotency — optional for operators)
   - `supabase/migrations/20260716_rls_update_with_check.sql` (RLS hardening — recommended)
4. Copy `.env.example` → `.env.local` with Supabase URL + anon key
5. `npm run dev` → sign up, create project on **Projects**, create + assign task with due date on **Dashboard**
6. Edit project name/description and reassign tasks after creation
7. Production deployed to Vercel with env vars set

**Email digests (optional infra):** See build repo `docs/BREVO_EMAIL_SETUP.md` for Brevo sender verification, Edge Function secrets, and `supabase/sql/schedule_email_digest_cron.sql` (daily 08:00 UTC). Reviewers do not need this to use the app.

## Architecture summary

- **Frontend:** Next.js 16 App Router + Tailwind CSS v4
- **Auth:** Supabase Auth (email/password, cookie sessions via `@supabase/ssr`)
- **Database:** Supabase Postgres with RLS on `profiles`, `projects`, `tasks`, `notifications`, `email_sent_log`
- **Hosting:** Vercel (production alias `pm-joes9987.vercel.app`)
- **Theming:** `next-themes` — system preference default, manual light/dark toggle
- **Email digests:** Supabase Edge Function (`send-deadline-reminders`) + Brevo API + pg_cron (08:00 UTC daily)

```
User → Next.js pages/components
     → Supabase Auth (session cookies)
     → Postgres (profiles, projects, tasks, notifications)
     → RLS policies + DB triggers (assignment/completion notifications)

pg_cron (08:00 UTC daily)
     → Edge Function send-deadline-reminders
     → Postgres (tasks, profiles, email_sent_log)
     → Brevo API → assignee inbox
```

## Motivation / engagement design notes

- **Cohort-first framing:** Landing copy targets 30+ daily users coordinating eight deliverables — not a generic todo app.
- **Low-friction onboarding:** Open email/password signup so reviewers and staff can create accounts without builder assistance.
- **Deadline visibility:** Optional task due dates with color-coded urgency badges and quick filters (My tasks, Overdue, Due this week).
- **In-app nudges:** Notification bell for assignments, due-soon/overdue tasks, and completed tasks (for task creators).
- **Email digests:** One daily digest per assignee (overdue / due today / due tomorrow) via Brevo; idempotent via `email_sent_log`.
- **Progress feedback:** Dashboard motivation panel (Focus today, completion rate, on-time rate) and `/progress` page with per-project metrics.
- **Project goals:** Optional `target_date` on projects with countdown on Projects and Progress pages.
- **Visible filters:** Task board filters by project, status, assignee, plus motivation quick filters.
- **Post-creation edits:** Project owners can rename/edit projects; task creators, assignees, and project owners can edit and reassign tasks.
- **Archive, not delete:** Projects archive instead of hard-delete to preserve history during operator cutover.
- **Guided empty states:** Dashboard prompts users to create a project first when the project dropdown would otherwise be empty.

## Demo script (motivation features)

1. User A creates a project with a target deadline on **Projects**
2. User A creates a task assigned to User B with due date tomorrow on **Dashboard**
3. User B sees assignment notification in the bell icon
4. Set a task due date in the past → overdue badge + Focus today widget updates
5. Mark task done → completion message + on-time rate updates on dashboard
6. Open **Progress** → see project completion bar and overdue count
7. Edit project on **Projects** or reassign a task on **Dashboard**
8. *(Optional)* Assignee with due/overdue tasks receives daily digest email (Brevo transactional log or inbox)

## Known limitations

- Email digests require Brevo account onboarding + verified sender + Supabase Edge Function secrets (not auto-configured on clone; reviewers can skip)
- No GitHub issue linking yet
- No review/vote module (differentiator backlog for later projects)
- Email confirmation should remain disabled in Supabase Auth for frictionless reviewer signup during review week

## Agent usage summary

- **Research:** Phase 1 requirements, submission format, cohort template conventions
- **Development:** Cursor Agent scaffolded Next.js app, Supabase schema + RLS, auth flows, project/task UI, motivation features (due dates, notifications, progress metrics), Brevo email digest Edge Function + pg_cron, Vercel deploy, UI polish
- **QA:** Production URL smoke test (200), Supabase linked, signup/auth verified on production, email digest send verified (`sent: 1`), fresh-clone setup checklist in README
