# Conexus

**From Conversation to Coordination** — Hult Cohort Developer Program, Phase 1 Project 2 (internal communications platform).

Product requirements: [`docs/PRD.md`](docs/PRD.md) (single source of truth).

## Stack (PRD §6)

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Realtime, Storage)
- Playwright smoke tests per build step
- Vercel deploy in **Phase B** (no production URL yet)

## Phase A status

| Step | Status |
|------|--------|
| 1. Scaffold (tokens, shell, Manrope, Supabase clients) | ✅ |
| 2. Schema + RLS + seed | ✅ |
| 3–11 | Not started |

## Local setup (fresh clone)

```bash
cd submissions/lorra-v-project-2
npm install
cp .env.example .env.local
```

Fill `.env.local` with your **Supabase dev** values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key OK)
- `SUPABASE_SERVICE_ROLE_KEY` (secret key OK)
- `DATABASE_URL` — Postgres URI from Dashboard → Project Settings → Database → Connection string (Session pooler). Required for `npm run db:apply`.

Then:

```bash
npm run db:apply
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Seed logins (local only):** password `ConexusSeed!2026` for all seeded users, e.g. `admin@conexus.local`.

### Alternate schema apply (no DATABASE_URL)

In the Supabase SQL Editor, run in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`

Then `npm run db:seed`.

### Smoke tests

```bash
npm run test:e2e:step1
npm run test:e2e:step2   # after db:apply + db:seed
```

## Design tokens (PRD §8)

Teal `#3CBBB1`, navy `#16324F`, slate `#5B6B7A`, soft gray `#F3F5F7`, surface white, accent gold `#F4B942`, Manrope 400/500/600/700.

## Navigation (PRD §5)

Sidebar: Home, Messages, Threads, Tasks, Files, plus channel/DM lists. Stretch items (Teams, Calendar, AI) are deferred.
