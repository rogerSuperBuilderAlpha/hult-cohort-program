# Pilot — Hult Cohort PM (Project 1)

Production project-management board for the Hult Cohort Developer Program Summer Pilot 2026.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://pilot-hult-pm.vercel.app

## Stack

- **Next.js 15** (App Router) on **Vercel**
- **Supabase** (Postgres + service-role server access)
- Email + password auth (bcrypt + signed HTTP-only cookies)

## Features (baseline)

- Create / edit / archive projects
- Tasks with title, description, status (`TODO` / `IN_PROGRESS` / `DONE`), assignee, due date
- Assign to any registered cohort member
- Filter tasks by project, status, assignee
- Motivation-focused dashboard: ship-next queue, progress bars, overdue signals, weekly ship count

## Fresh-clone setup

```bash
cd submissions/kiaracaesar5627-project-1
cp .env.example .env
# Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET
# Run supabase/migrations/20260713_init.sql in the Supabase SQL editor
npm install
npm run db:seed
npm run build
npm run dev
```

Open http://localhost:3000

### Seed accounts

| Role  | Email                           | Password         |
|-------|---------------------------------|------------------|
| Demo  | `demo@hult-cohort.test`         | `DemoPass1!`     |
| Staff | `staff-review@hult-cohort.test` | `StaffReview1!`  |
| Peer  | `peer@hult-cohort.test`         | `PeerPass1!`     |

Or register any new account from `/register` (supports ≥30 accounts).

## Architecture

```
Browser → Next.js (Vercel)
            ├─ Server Actions (auth, projects, tasks)
            ├─ JWT session cookie (AUTH_SECRET)
            └─ @supabase/supabase-js (service role) → Supabase Postgres
```

Schema lives in `supabase/migrations/20260713_init.sql` (users / projects / tasks + RLS).

## Deploy (Vercel)

1. Create a Vercel project rooted at `submissions/kiaracaesar5627-project-1`
2. Set env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`
3. Build command: `next build` (default)

## Known limitations

- No email notifications / due-date reminders yet
- No comments threads or GitHub issue sync yet
- Auth is email/password only (no OAuth)
- Server uses the Supabase **service role**; do not expose that key to the browser

## License

MIT (inherits cohort program license context)
