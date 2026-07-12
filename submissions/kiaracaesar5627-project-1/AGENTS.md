# AGENTS.md — Pilot (Project 1 PM)

## Goal

Ship a production HTTPS project-management app the Summer Pilot cohort can use for projects, tasks, assignments, and motivation signals.

## Commands

```bash
npm install
# apply supabase/migrations/20260713_init.sql in Supabase SQL editor
npm run db:seed
npm run dev
npm run build
```

## Env

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`

Never commit `.env`.

## Key paths

- `src/lib/actions.ts` — server actions (auth + CRUD)
- `src/lib/db.ts` — Supabase data access
- `src/lib/supabase.ts` — service-role client
- `supabase/migrations/20260713_init.sql` — schema
- `src/app/dashboard/page.tsx` — motivation board

## Do not

- Hardcode secrets
- Use Prisma or local JSON files for task persistence
- Put `SUPABASE_SERVICE_ROLE_KEY` in client bundles
