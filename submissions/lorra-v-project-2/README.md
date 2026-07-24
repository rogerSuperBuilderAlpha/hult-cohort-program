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
| 3. Auth (Google SSO, allowlist, magic link, local demo login) | ✅ |
| 4–11 | Not started |

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
- `DATABASE_URL` — optional if you applied SQL in the dashboard
- `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` — shows localhost seed password login
- `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD` — defaults to seed admin

**Supabase Auth setup (Google):**
1. Auth → Providers → Google: enable with Client ID/Secret from Google Cloud.
2. Google Cloud authorized redirect URI: `{SUPABASE_URL}/auth/v1/callback`
3. Auth → URL Configuration:
   - **Site URL:** `http://localhost:3000` (must NOT include `/**` — that caused post-login 404s)
   - **Redirect URLs:** `http://localhost:3000/**`

4. Auth → Providers → Email: enable (needed for magic link + seed password login)

Then:

```bash
npm run db:seed   # if not already seeded
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirected to `/login`.

**Seed logins (local only):** password `ConexusSeed!2026` for all seeded users, e.g. `admin@conexus.local`.

### Alternate schema apply (no DATABASE_URL)

In the Supabase SQL Editor, run in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`

Then `npm run db:seed`.

### Smoke tests

```bash
npm run test:e2e:step1
npm run test:e2e:step2   # after schema + seed
npm run test:e2e:step3   # auth gate + seed login
```

## Design tokens (PRD §8)

Teal `#3CBBB1`, navy `#16324F`, slate `#5B6B7A`, soft gray `#F3F5F7`, surface white, accent gold `#F4B942`, Manrope 400/500/600/700.

## Navigation (PRD §5)

Sidebar: Home, Messages, Threads, Tasks, Files, plus channel/DM lists. Stretch items (Teams, Calendar, AI) are deferred.
