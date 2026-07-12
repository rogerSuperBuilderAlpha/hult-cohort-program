# AGENTS.md — Pilot (Project 1 PM)

## Goal

Ship a production HTTPS project-management app the Summer Pilot cohort can use for projects, tasks, assignments, and motivation signals.

## Commands

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
npm run build
```

## Env

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — long random string for session JWTs

Never commit `.env`.

## Key paths

- `src/lib/actions.ts` — server actions (auth + CRUD)
- `src/lib/auth.ts` — session cookies
- `prisma/schema.prisma` — User / Project / Task model
- `src/app/dashboard/page.tsx` — motivation board

## Do not

- Hardcode secrets
- Store task data only in local JSON files (must survive Vercel redeploys)
