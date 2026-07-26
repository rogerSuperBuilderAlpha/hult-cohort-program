# AGENTS.md — Relay (Project 2 Comms)

## Goal

Ship a production cohort communications platform: public channels, 1:1 DMs,
admin announcements, keyword search, 30-day history, in-app notifications, and
≤5s polling for new messages.

## Commands

```bash
npm install
# apply supabase/migrations/20260726_relay_init.sql in Supabase SQL editor
npm run db:seed
npm run dev
npm run build
```

## Env

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`
- `NEXT_PUBLIC_PM_URL` (FlexiFlow deep link; default production PM URL)

Never commit `.env` / `.env.local`.

## Key paths

- `src/lib/actions.ts` — auth, channels, messages, DMs, notifications
- `src/lib/db.ts` — Supabase access (`relay_*` tables)
- `src/lib/auth.ts` — JWT cookie session
- `src/components/MessagePane.tsx` — polling message list
- `src/components/AppShell.tsx` — sidebar + PM deep link
- `src/app/api/messages/route.ts` — poll endpoint
- `src/app/app/c/[slug]/page.tsx` — channel chat
- `src/app/app/dm/[id]/page.tsx` — DM thread

## Conventions

- Only `ADMIN` may create/rename/archive channels or post in announcements.
- DMs use a sorted `dm_key` for uniqueness between two users.
- History queries filter `created_at >= now() - 30 days`.
- Prefer the same emails as FlexiFlow for cohort account matching.

## Do not

- Import `firebase-admin`; this app uses Supabase.
- Put `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
- Write to FlexiFlow tables (`users`, `workspaces`, …) — Relay uses `relay_*`.
