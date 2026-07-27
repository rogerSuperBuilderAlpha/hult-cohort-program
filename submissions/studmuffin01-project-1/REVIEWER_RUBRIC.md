# Reviewer Rubric — Phase 1 Project 1 (INITIARA)

This document maps the **original reviewer feedback** (pre-Supabase) to the **current implementation**, with file paths a reviewer can verify quickly.

**Terminology:** The brief says **Projects**; this app uses **Initiatives** (same concept).

---

## Scorecard

| # | Requirement | Original feedback | **Current status** | Where to verify |
|---|-------------|-------------------|--------------------|-----------------|
| 1 | ≥3 task status states | ✓ Done | **✓ Done** | `lib/initiativeTasks.ts` (`TASK_STATUS_OPTIONS`); status `<select>` in `components/InitiativeTaskRow.tsx` |
| 2 | Projects create / edit / archive | ~ partial (no archive; localStorage) | **✓ Done** | Create: `/start-new-initiative`; edit title: **Edit** in `components/Dashboard.tsx` (`InitiativeTitleCell`); archive by row: Executive Summary **Archive Initiative**; restore/delete archived: `useInitiatives.ts` |
| 3 | Tasks (title/desc/status/assignee) | ~ partial (`responsibility` free text) | **✓ Done** | **Task** column = description/title (`InitiativeSummary.tsx`); status, due date, comments in `InitiativeTaskRow.tsx`; **Assignee** roster dropdown (not free text) |
| 4 | Assignment to any member | ✗ No member concept | **✓ Done** | Roster: `/team-members` (`TeamMembersPanel.tsx`, `lib/teamMembers.ts`); assignee `<select>` fed by `memberNames` from `hooks/useTeamMembers.ts` |
| 5 | Multi-user auth | ✗ None | **✓ Done** | Supabase email auth: `/auth/login`, `/auth/signup`, `/auth/callback`; session in `app/layout.tsx` + `AuthProvider`; route gate in `lib/supabase/middleware.ts` |
| 6 | Task views filtered by assignee / status / project | ✗ No filtering | **✓ Done** | `components/TaskFilterBar.tsx`, `lib/taskFilters.ts`, wired in `components/InitiativeSummary.tsx` |
| 7 | Public HTTPS deploy + server persistence | ~ localStorage only | **✓ Done** | Vercel deploy (see README); logged-in persistence via Supabase (`custom_initiatives`, `user_app_data`); API routes under `app/api/dashboard/` |
| 8 | No secrets committed | ✓ Clean | **✓ Done** | `.env.local` gitignored; `.env.example` has placeholders only |
| 9 | AGENTS.md present | ✓ Present | **✓ Done** | `AGENTS.md` at submission root |

**Rubric: 9/9 implemented** for an authenticated, per-user PM dashboard.

---

## Intentional scope note (not rubric failures)

These were **not** in the original nine items but are worth stating in a review:

| Topic | Behavior |
|-------|----------|
| **Shared workspace** | Data is **per authenticated user** (RLS on `auth.uid()`), not a single shared team database. Two users do not see each other's initiatives. |
| **“Multi-user”** | Multiple people can **sign up and use the platform**; collaboration is not real-time shared editing. |
| **Logged-out mode** | Dashboard routes require auth (`lib/navigation.ts` → middleware). localStorage fallback exists in hooks for migration/offline patterns but is not the primary logged-in path. |
| **Task field name** | Assignee is stored as `responsibility` in JSON/DB for backward compatibility; UI label is **Assignee**. |
| **Motivation log** | Sent Messages use browser `localStorage` only (`initiara-motivation-log`). |

---

## Quick reviewer walkthrough (5 minutes)

1. Open production or `npm run dev` → sign up / log in.
2. **Start New Initiative** → create a project.
3. **Team Members** → add at least one member.
4. On dashboard task table → set status, assignee (dropdown), due date.
5. Use **TaskFilterBar** (status / assignee / project).
6. Executive Summary → **Edit** initiative title; **Archive Initiative** by row number.
7. Refresh → data persists (Supabase when logged in).
8. **Sign out** → middleware redirects unauthenticated users to `/auth/login`.

---

## Tests & build

```bash
npm test      # Vitest: parsers, health/overdue, API 401 guards, body limits
npm run lint
npm run build
```

See README **Fresh Clone Verification** for full setup (Supabase `schema.sql` required).
