# AGENTS.md — INITIARA (Project 1)

## Goal

Maintain a cohort progress dashboard for the Summer Pilot 2026 curriculum: executive summary health, six initiative tracking tables (67 rows each), and motivation-oriented sidebar placeholders.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start    # after build
npm run lint
```

No `.env` file is required. All persistence is browser `localStorage`.

## Key paths

- `app/page.tsx` — server entry; renders `DashboardPage`
- `components/DashboardPage.tsx` — client shell (Command Center + main content)
- `components/Dashboard.tsx` — Executive Summary table
- `components/InitiativeSummary.tsx` — six initiative tables (virtualized rows)
- `components/CohortRow.tsx` — checkbox row, editable name, gamification tiers
- `hooks/useCohortSubmissions.ts` — state + debounced localStorage sync (400ms)
- `lib/cohortSubmissions.ts` — parse/validate storage (slug whitelist, 1MB cap)
- `lib/health.ts` — overall health colors (inline hex — Tailwind classes in `lib/` are not scanned)
- `lib/rowTiers.ts` — row status tier colors and legend

## Storage keys

- `initiara-cohort-submissions` — checkbox + name data per initiative
- `initiara-theme` — dark/light preference

## Do not

- Add hardcoded secrets or commit `.env.local`
- Replace localStorage with fake “shared” data — this app is single-browser by design until a backend is added
- Remove debouncing from `useCohortSubmissions` without measuring write frequency
- Use duplicate `GoToNav` menu IDs — pass unique `menuIdSuffix` per initiative table
- “Fix” health colors with Tailwind utility classes inside `lib/health.ts` without updating `tailwind.config.ts` content paths

## Known product gaps (intentional for this submission)

- No multi-user auth, projects/tasks CRUD, or shared database
- Sidebar routes (`/my-status`, `/action-items`, etc.) are placeholders
- Cohort % counts rows with any checkbox ticked or a non-empty name (see `lib/cohortSubmissions.ts`)
