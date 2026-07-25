# Conexus

**From Conversation to Coordination** — Hult Cohort Developer Program, Phase 1 Project 2 (internal communications platform).

Product requirements: [`docs/PRD.md`](docs/PRD.md) (single source of truth).

## Stack (PRD §6)

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Realtime, Storage)
- Playwright smoke tests per build step
- Vercel deploy in **Phase B** (production HTTPS URL set when deployed — never invent one)

## Phase status

| Phase | Status |
|-------|--------|
| A — Build Steps 1–11 | ✅ complete (local) |
| B — Vercel deploy + shared Supabase production posture | ⏳ in progress |
| C — Submission PR | not started |

**Supabase:** one project doubles as local/dev and production. There is no separate staging DB.

### Seed safety

`npm run db:seed` **refuses** unless you pass an explicit CLI flag (env vars alone are not enough):

```bash
npm run db:seed -- --confirm
```

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
npm run db:seed -- --confirm   # required flag — shared Supabase project
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirected to `/login`.

**Seed logins (local only):** password `ConexusSeed!2026` for all seeded users, e.g. `admin@conexus.local` / `asha@conexus.local`.

### Schema apply (no DATABASE_URL)

In the Supabase SQL Editor, run in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_storage.sql` (attachments bucket)
4. `supabase/migrations/004_thread_subscriptions.sql` (Threads unread)
5. `supabase/migrations/005_search_fts.sql` (optional ranked FTS; search falls back to `ilike`)

Then `npm run db:seed -- --confirm`.

### Smoke tests

```bash
npm run test:e2e:step1
npm run test:e2e:step2   # after schema + seed
npm run test:e2e:step3   # auth gate + seed login
npm run test:e2e:step4   # channel messaging
npm run test:e2e:step5   # DMs
npm run test:e2e:step6   # threads
npm run test:e2e:step7   # notifications
npm run test:e2e:step8   # Forth adapter (fixtures)
npm run test:e2e:step9   # create ticket + unfurl
npm run test:e2e:step10  # home / tasks / files / search / presence
npm run test:e2e:step11  # polish smoke
```

### Forth adapter (Step 8)

Default is **fixture mode** (`FORTH_USE_FIXTURES=true`) so local demos never block on Forth HTTP.

| Piece | Path |
|-------|------|
| `PMAdapter` + `ForthAdapter` + `FixtureAdapter` | `src/lib/forth/` |
| Webhook | `POST /api/webhooks/forth` (`X-Forth-Signature: sha256=…`) |
| Poller | `POST /api/cron/poll-forth` (Bearer `CRON_SECRET`, or open in fixture mode) |
| Status | `GET /api/forth/status` |

Live mode: set `FORTH_USE_FIXTURES=false`, `FORTH_API_KEY`, and `FORTH_WEBHOOK_SECRET` once the §7.0 contract is agreed.

## 15-minute handover / redeploy (PRD §6)

Target: a teammate can run Conexus locally (or redeploy later on Vercel) without tribal knowledge.

1. **Clone + install** — `cd submissions/lorra-v-project-2 && npm install`
2. **Env** — copy `.env.example` → `.env.local`; fill Supabase URL, anon key, service role. Keep Forth on fixtures unless the §7.0 contract is live.
3. **Schema** — apply migrations `001`–`004` (and `005` if you want FTS) in the SQL Editor, or `npm run db:apply` when `DATABASE_URL` is set.
4. **Seed** — `npm run db:seed -- --confirm` (creates ~10 users + `#general` / `#announcements` / `#random`). Always confirm deliberately — same DB as production.
5. **Auth** — enable Email + Google in Supabase; set Site URL to the app origin (no trailing `/**` on Site URL). After Vercel deploy, add the production origin to Redirect URLs.
6. **Run locally** — `npm run dev` → login as `admin@conexus.local` / `ConexusSeed!2026` when `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true`.
7. **Health** — `GET /api/health` and `GET /api/forth/status` should return `ok: true`.
8. **Verify** — `npm run build` then a Playwright smoke before handing off.

### Phase B — Vercel (shared Supabase)

1. Import `submissions/lorra-v-project-2` as the Vercel root (or set Root Directory to that path).
2. Copy the same Supabase env vars from `.env.local` into the Vercel project (never commit secrets).
3. Set `NEXT_PUBLIC_APP_URL` to the real Vercel HTTPS URL once it exists.
4. Set `NEXT_PUBLIC_ENABLE_DEV_LOGIN=false` (or omit) in Vercel production so seed-password login stays local-only.
5. In Supabase Auth → URL Configuration, add the Vercel origin to **Redirect URLs** (keep localhost for local work).
6. Redeploy after env changes; confirm `/api/health` on the deployed host.

**Do not invent production URLs or credentials** — paste the real Vercel URL into env/docs only after deploy.

## Design tokens (PRD §8)

Teal `#3CBBB1`, navy `#16324F`, slate `#5B6B7A`, soft gray `#F3F5F7`, surface white, accent gold `#F4B942`, Manrope 400/500/600/700.

## Navigation (PRD §5)

Sidebar: Home, Messages, Threads, Tasks, Files, plus channel/DM lists. Stretch items (Teams, Calendar, AI) are deferred.
