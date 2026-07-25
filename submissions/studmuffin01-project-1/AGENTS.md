# AGENTS.md — INITIARA (Project 1)

## Goal

Multi-user initiative tracking dashboard: Executive Summary health, initiative task tables (To Do / In Progress / Done), Team Members roster with assignee picker, task filtering, initiative edit/archive, Supabase auth and per-user persistence, and Command Center sidebar pages (member status, action items, motivation, leaderboards, AI portfolio coach).

See [REVIEWER_RUBRIC.md](./REVIEWER_RUBRIC.md) for mapping to the Phase 1 reviewer checklist.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start    # after build
npm run lint
npm test
```

Copy `.env.example` → `.env.local` and set Supabase values before using auth or database sync. See [DEPLOY.md](./DEPLOY.md) for local and production setup.

## Key paths

- `app/page.tsx` — server entry; renders `DashboardPage`
- `app/layout.tsx` — loads Supabase session; wraps `AuthProvider`
- `app/auth/login`, `app/auth/signup`, `app/auth/callback` — Supabase auth flow
- `components/DashboardPage.tsx` — client shell (Command Center + main content)
- `components/Dashboard.tsx` — Executive Summary table
- `components/InitiativeSummary.tsx` — initiative task tables
- `components/PageHeader.tsx` — gateway mark, Sign Out / Log in, theme toggle, mobile Command Center toggle
- `components/CommandCenterPageShell.tsx` — wraps pages with mobile drawer state + `PageShell`
- `hooks/CommandCenterMobileProvider.tsx` — mobile Command Center open/close state
- `hooks/useInitiatives.ts` — initiatives (edit, archive, CRUD); Supabase when logged in
- `hooks/useTeamMembers.ts` — roster for assignee picker; debounced sync (400ms)
- `hooks/useInitiativeTasks.ts` — tasks; debounced Supabase/localStorage sync (400ms)
- `hooks/useSidebarData.ts` — shared data for sidebar pages (initiatives, tasks, members)
- `hooks/SidebarDataProvider.tsx` — shares sidebar data with AI Assistant + sidebar pages
- `lib/assistantPortfolioContext.ts`, `lib/assistantCoach.ts` — portfolio coach for AI Assistant
- `components/AiAssistantPanel.tsx` — Command Center AI Assistant UI
- `lib/dashboardStyles.ts` — gateway-aligned dashboard shell, panels, and nav accents
- `lib/executiveSummaryMetrics.ts` — progress, open/overdue task counts for Executive Summary
- `lib/sidebarStats.ts` — aggregations for Member Status, Action Items, leaderboards
- `components/MemberStatusPage.tsx`, `ActionItemsPage.tsx`, etc. — sidebar screens
- `hooks/useSupabaseUser.ts` — re-exports `useAuth()` from `AuthProvider`
- `lib/supabase/` — browser/server clients, repositories, auth redirect helpers
- `components/TaskFilterBar.tsx` — filter tasks by status, assignee, project
- `components/TeamMembersPage.tsx`, `TeamMembersPanel.tsx` — roster management at `/team-members`
- `app/api/dashboard/initiatives/route.ts` — GET + PATCH (title, archive)
- `app/api/dashboard/members/route.ts` — GET/PUT team member roster
- `supabase/schema.sql` — tables + RLS (safe to re-run; includes `archived` + `team_members` keys)
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
- `initiara-theme` — dark/light preference
- `initiara-motivation-log` — Sent Messages from Motivate A Friend (device-only; not synced to Supabase)

## Do not

- Add hardcoded secrets or commit `.env.local`
- Remove debouncing from `useInitiativeTasks` without measuring write frequency
- Use duplicate `GoToNav` menu IDs — pass unique `menuIdSuffix` per initiative table
- “Fix” health colors with Tailwind utility classes inside `lib/health.ts` without updating `tailwind.config.ts` content paths

## Known product gaps (out of rubric scope)

- No **shared workspace** (data is per authenticated user, not one collaborative database)
- Leaderboards and AI Assistant reflect the **current user's** task data only
- Sent Messages (Motivate A Friend) are **device-local** (`initiara-motivation-log`), not Supabase-synced
