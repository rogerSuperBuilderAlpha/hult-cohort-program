# Project 1 Submission — @joes9987

Summer Pilot 2026, Project 1 — PM platform.

## Production URL

https://pm-joes9987.vercel.app

Build repo: https://github.com/joes9987/pm-joes9987

Supabase project: `pm-joes9987` (`vidprovlxevofniwyhgs`) — schema applied, Vercel env configured.

## Setup steps verified on fresh clone

1. `git clone https://github.com/joes9987/pm-joes9987.git && cd pm-joes9987`
2. `npm install`
3. Run `supabase/schema.sql` in Supabase SQL editor (or `supabase db query --linked -f supabase/schema.sql` after linking)
4. Copy `.env.example` → `.env.local` with Supabase URL + anon key
5. `npm run dev` → sign up, create project on **Projects**, create + assign task on **Dashboard**
6. Production deployed to Vercel with env vars set

## Architecture summary

- **Frontend:** Next.js 16 App Router + Tailwind CSS v4
- **Auth:** Supabase Auth (email/password, cookie sessions via `@supabase/ssr`)
- **Database:** Supabase Postgres with RLS on `profiles`, `projects`, `tasks`
- **Hosting:** Vercel (production alias `pm-joes9987.vercel.app`)
- **Theming:** `next-themes` — system preference default, manual light/dark toggle

```
User → Next.js pages/components
     → Supabase Auth (session cookies)
     → Postgres (profiles, projects, tasks)
     → RLS policies (authenticated read/write)
```

## Motivation / engagement design notes

- **Cohort-first framing:** Landing copy targets 30+ daily users coordinating eight deliverables — not a generic todo app.
- **Low-friction onboarding:** Open email/password signup so reviewers and staff can create accounts without builder assistance.
- **Visible filters:** Task board filters by project, status, and assignee — mirrors how cohort members triage work during review weeks.
- **Archive, not delete:** Projects archive instead of hard-delete to preserve history during operator cutover.
- **Guided empty states:** Dashboard prompts users to create a project first when the project dropdown would otherwise be empty.

## Known limitations

- No due dates, notifications, or GitHub issue linking yet
- No review/vote module (differentiator backlog for later projects)
- Email confirmation should remain disabled in Supabase Auth for frictionless reviewer signup during review week

## Agent usage summary

- **Research:** Phase 1 requirements, submission format, cohort template conventions
- **Development:** Cursor Agent scaffolded Next.js app, Supabase schema + RLS, auth flows, project/task UI, Vercel deploy, UI polish (contrast, dropdown UX, theme toggle)
- **QA:** Production URL smoke test (200), Supabase linked, signup/auth verified on production, fresh-clone setup checklist in README
