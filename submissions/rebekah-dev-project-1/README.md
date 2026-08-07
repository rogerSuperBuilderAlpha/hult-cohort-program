# Momentum — Hult Cohort PM Platform

Project management platform for the Hult Cohort Developer Program (Summer 2026, Phase 1 · Project 1).
Multi-user auth, shared projects, a task board with deadlines, and motivation mechanics:
shipping streaks, week-over-week momentum, ranked next actions, and a cohort-wide ship feed.

**Stack:** Next.js 16 (App Router, server actions) · Prisma 6 · Postgres (Neon) · Auth.js v5 (credentials + JWT) · Tailwind CSS v4 · Vercel

## Setup (fresh clone)

Requirements: Node 20+ and a Postgres database (a free [Neon](https://neon.tech) project works).

```bash
cd submissions/rebekah-dev-project-1
npm install                 # also runs `prisma generate` via postinstall
cp .env.example .env        # then fill in DATABASE_URL and AUTH_SECRET
npx prisma migrate deploy   # apply migrations to your database
npm run dev                 # http://localhost:3000
```

Verify:

```bash
npm test        # unit tests (streak / progress / momentum math)
npm run build   # production build
```

## How it works

- `prisma/schema.prisma` — User, Project, ProjectMember, Task (status, priority, due date, assignee, completedAt).
- `src/lib/auth.ts` — Auth.js credentials provider, bcrypt-hashed passwords, JWT sessions.
- `src/lib/actions.ts` — all mutations as server actions with zod validation and membership checks.
- `src/lib/stats.ts` — pure motivation math (streaks, momentum, progress), unit-tested in `tests/`.
- `src/app/(app)/` — authenticated shell: dashboard, project list, per-project kanban board.

## Motivation design

- **Next actions:** the dashboard ranks your open tasks by priority then deadline — no deciding what to do next.
- **Streaks:** consecutive days with at least one shipped task; survives until end of the next day.
- **Momentum:** tasks shipped this week vs last, with a delta arrow.
- **Ship feed:** everyone sees what the cohort just shipped — public progress is contagious.
- **Progress bars** on every project make "almost done" visible.
