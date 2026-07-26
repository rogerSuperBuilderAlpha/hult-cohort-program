# AGENTS.md — Huddle (Project 2 Comms)

## Goal

Ship a production cohort communications platform (**Huddle**): public channels, 1:1 DMs,
admin announcements, keyword search, 30-day history, in-app notifications, and
≤5s polling for new messages. **Do not use Supabase.**

## Commands

```bash
npm install
npm run db:seed
npm run dev
npm run build
```

## Env

- `AUTH_SECRET` (required)
- `NEXT_PUBLIC_PM_URL` (FlexiFlow deep link)
- Optional durable DB: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`

Never commit `.env` / `.env.local` / `data/*.db`.

## Key paths

- `src/lib/client.ts` — libsql client + schema bootstrap
- `src/lib/db.ts` — queries/mutations
- `src/lib/seed.ts` / `src/lib/bootstrap.ts` — demo data
- `src/lib/actions.ts` — server actions
- `src/components/MessagePane.tsx` — polling UI
- `src/app/api/messages/route.ts` — poll endpoint

## Conventions

- Only `ADMIN` may create/rename/archive channels or post in announcements.
- DMs use a sorted `dm_key` for uniqueness.
- History queries filter `created_at >= now() - 30 days`.
- Prefer the same emails as FlexiFlow for cohort account matching.

## Do not

- Reintroduce Supabase / `firebase-admin`.
- Commit the SQLite database file.
