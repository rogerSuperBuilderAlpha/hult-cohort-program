# Conexus

**From Conversation to Coordination** — Hult Cohort Developer Program, Phase 1 Project 2 (internal communications platform).

Product requirements: [`docs/PRD.md`](docs/PRD.md) (single source of truth).

## Stack (PRD §6)

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Realtime, Storage) — wired in later steps
- Playwright smoke tests per build step
- Vercel deploy in **Phase B** (no production URL yet)

## Phase A status

| Step | Status |
|------|--------|
| 1. Scaffold (tokens, shell, Manrope, Supabase clients) | ✅ |
| 2–11 | Not started |

## Local setup (fresh clone)

```bash
cd submissions/lorra-v-project-2
npm install
cp .env.example .env.local
```

Fill `.env.local` with your **Supabase dev** URL and anon key (ask the project owner — never invent credentials). Step 1 UI runs without calling Supabase; keys are required once Auth/schema steps land.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Smoke test (Step 1)

```bash
npx playwright test tests/step1-scaffold.spec.ts
```

## Design tokens (PRD §8)

Teal `#3CBBB1`, navy `#16324F`, slate `#5B6B7A`, soft gray `#F3F5F7`, surface white, accent gold `#F4B942`, Manrope 400/500/600/700.

## Navigation (PRD §5)

Sidebar: Home, Messages, Threads, Tasks, Files, plus channel/DM lists. Stretch items (Teams, Calendar, AI) are deferred.
