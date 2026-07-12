# Pilot — Hult Cohort PM (Project 1)

Production project-management board for the Hult Cohort Developer Program Summer Pilot 2026.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://pilot-hult-pm.vercel.app

## Stack

- **Next.js 15** (App Router) on **Vercel**
- **PostgreSQL** via Prisma Postgres (`DATABASE_URL`)
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
# Set DATABASE_URL (npx create-db@latest --json) and AUTH_SECRET
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Seed accounts

| Role  | Email                         | Password       |
|-------|-------------------------------|----------------|
| Demo  | `demo@hult-cohort.test`       | `DemoPass1!`   |
| Staff | `staff-review@hult-cohort.test` | `StaffReview1!` |
| Peer  | `peer@hult-cohort.test`       | `PeerPass1!`   |

Or register any new account from `/register` (supports ≥30 accounts).

## Architecture

```
Browser → Next.js (Vercel)
            ├─ Server Actions (auth, projects, tasks)
            ├─ JWT session cookie (AUTH_SECRET)
            └─ Prisma → PostgreSQL
```

## Deploy (Vercel)

1. Create a Vercel project rooted at `submissions/kiaracaesar5627-project-1`
2. Set env vars: `DATABASE_URL`, `AUTH_SECRET`
3. Build command: `prisma migrate deploy && prisma generate && next build`
4. Claim the Prisma Postgres DB (if using create-db) so it does not expire after 24h

## Known limitations

- No email notifications / due-date reminders yet
- No comments threads or GitHub issue sync yet
- Auth is email/password only (no OAuth)
- Temporary Prisma Postgres DBs must be **claimed** or they delete after 24 hours

## License

MIT (inherits cohort program license context)
