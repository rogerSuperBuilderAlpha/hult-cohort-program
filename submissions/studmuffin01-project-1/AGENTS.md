# AGENTS.md — INITIARA (Project 1)

## Goal

Cohort progress dashboard for the Summer Pilot 2026 curriculum: executive summary health, initiative task tables (To Do / In Progress / Done), per-user persistence via Supabase when authenticated, and motivation-oriented sidebar placeholders.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start    # after build
npm run lint
```

Copy `.env.example` → `.env.local` and set Supabase values before using auth or database sync. See [DEPLOY.md](./DEPLOY.md) for local and production setup.

## Key paths

- `app/page.tsx` — server entry; renders `DashboardPage`
- `app/layout.tsx` — loads Supabase session; wraps `AuthProvider`
- `app/auth/login`, `app/auth/signup`, `app/auth/callback` — Supabase auth flow
- `components/DashboardPage.tsx` — client shell (Command Center + main content)
- `components/Dashboard.tsx` — Executive Summary table
- `components/InitiativeSummary.tsx` — initiative task tables
- `components/PageHeader.tsx` — Sign Out / Log in + theme toggle
- `hooks/useInitiatives.ts` — initiatives (edit, archive, CRUD); Supabase when logged in
- `hooks/useTeamMembers.ts` — roster for assignee picker; debounced sync (400ms)
- `hooks/useInitiativeTasks.ts` — tasks; debounced Supabase/localStorage sync (400ms)
- `hooks/useCohortSubmissions.ts` — cohort rows; debounced Supabase/localStorage sync (400ms)
- `hooks/useSupabaseUser.ts` — re-exports `useAuth()` from `AuthProvider`
- `lib/supabase/` — browser/server clients, repositories, auth redirect helpers
- `components/TaskFilterBar.tsx` — filter tasks by status, assignee, project
- `components/TeamMembersPanel.tsx` — roster management for assignee picker
- `app/api/dashboard/initiatives/route.ts` — GET + PATCH (title, archive)
- `app/api/dashboard/members/route.ts` — GET/PUT team member roster
- `supabase/schema.sql` — tables + RLS; re-run Phase B migration block after pull
- `lib/cohortSubmissions.ts` — parse/validate cohort row storage
- `lib/initiativeTasks.ts` — task types, status options, storage helpers
- `lib/health.ts` — overall health colors (inline hex — Tailwind classes in `lib/` are not scanned)

## Persistence

| Mode | Where data lives |
|------|------------------|
| Logged in | Supabase (`custom_initiatives`, `user_app_data`) scoped per `auth.users` id |
| Logged out | Browser `localStorage` (legacy keys below) |
| First login | Local data migrates to Supabase if the remote account is empty |

### localStorage keys (logged-out fallback)

- `initiara-custom-initiatives` — user-created initiatives
- `initiara-initiative-tasks` — task tables per initiative
- `initiara-team-members` — assignee roster
- `initiara-cohort-submissions` — checkbox + name data per initiative
- `initiara-theme` — dark/light preference

## Do not

- Add hardcoded secrets or commit `.env.local`
- Remove debouncing from `useInitiativeTasks` / `useCohortSubmissions` without measuring write frequency
- Use duplicate `GoToNav` menu IDs — pass unique `menuIdSuffix` per initiative table
- “Fix” health colors with Tailwind utility classes inside `lib/health.ts` without updating `tailwind.config.ts` content paths

## Known product gaps (Phase C)

- No shared cohort workspace (data is per authenticated user, not collaborative)
- Sidebar routes (`/my-status`, `/action-items`, etc.) are placeholders
- Cohort % counts rows with any checkbox ticked or a non-empty name (see `lib/cohortSubmissions.ts`)
