# Conexus

**From Conversation to Coordination** — Hult Cohort Developer Program, Phase 1 Project 2 (internal communications platform).

Product requirements: [`docs/PRD.md`](docs/PRD.md) (single source of truth).

## Stack (PRD §6)

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Realtime, Storage)
- Playwright smoke tests per build step
- **Production:** [https://conexus-rust.vercel.app](https://conexus-rust.vercel.app) (Vercel project `conexus`)

## Phase status

| Phase | Status |
|-------|--------|
| A — Build Steps 1–11 | ✅ complete (local) |
| B — Vercel deploy + shared Supabase production posture | ✅ live at production URL above |
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

**Supabase Auth setup (open self-serve — Google + GitHub + magic link):**
1. Auth → Providers → **Google**: enable with Client ID/Secret from Google Cloud.
2. Auth → Providers → **GitHub**: enable with a GitHub OAuth App (callback `{SUPABASE_URL}/auth/v1/callback`).
3. Auth → Providers → **Email**: enable (magic link + local seed password login).
4. Auth → URL Configuration:
   - **Site URL:** `http://localhost:3000` locally (must NOT include `/**`)
   - **Redirect URLs:** `http://localhost:3000/**` and `https://conexus-rust.vercel.app/**`
5. Signup is open: any Google/GitHub/magic-link user becomes a **member** on first login (no allowlist).

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

| Item | Value |
|------|--------|
| Production URL | https://conexus-rust.vercel.app |
| Vercel project | `conexus` (team `lorraine-villaroels-projects`) |
| App root | `submissions/lorra-v-project-2` (deploy from this directory) |
| Health | https://conexus-rust.vercel.app/api/health |
| Forth status | https://conexus-rust.vercel.app/api/forth/status |

**Env on Vercel (production + preview):** `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_FORTH_BASE_URL`, `FORTH_USE_FIXTURES`, `NEXT_PUBLIC_APP_URL=https://conexus-rust.vercel.app`, `NEXT_PUBLIC_ENABLE_DEV_LOGIN=false`. Seed-password login stays local-only.

**Push / refresh env from `.env.local` (values never printed):**

```bash
node scripts/push-vercel-env.mjs --production --preview --app-url=https://conexus-rust.vercel.app
npx vercel deploy --prod --yes
```

**Supabase Auth (required for Google SSO on the deployed host):**

1. Auth → URL Configuration → **Redirect URLs** — add `https://conexus-rust.vercel.app/**` (keep `http://localhost:3000/**` for local).
2. Optionally set Site URL to `https://conexus-rust.vercel.app` for production-first OAuth (or leave localhost if you mostly develop locally).

## Design tokens (PRD §8)

Teal `#3CBBB1`, navy `#16324F`, slate `#5B6B7A`, soft gray `#F3F5F7`, surface white, accent gold `#F4B942`, Manrope 400/500/600/700.

## Navigation (PRD §5)

Sidebar: Home, Messages, Threads, Tasks, Files, plus channel/DM lists. Stretch items (Teams, Calendar, AI) are deferred.
