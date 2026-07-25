# AGENTS.md — FlexiFlow (Project 1 PM)

## Goal

Ship a production, fully **customizable** project-management app: workspaces,
roles, user-defined statuses/labels/fields, multiple views (List/Board/Table/
Calendar), dashboards, automations, notifications, and per-user theming.

## Commands

```bash
npm install
# apply, in order, in the Supabase SQL editor:
#   supabase/migrations/20260713_init.sql
#   supabase/migrations/20260717_flexiflow.sql
npm run db:seed
npm run dev
npm run build
```

## Env

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`

Never commit `.env` / `.env.local`.

## Key paths

- `src/lib/actions.ts` — all server actions (auth, workspaces, projects, tasks,
  settings, automations, notifications, theme)
- `src/lib/db.ts` — Supabase data access (service-role)
- `src/lib/workspace-server.ts` — membership/role guards (`requireWorkspaceRole`,
  `getShellData`), defaults seeding, automation runner
- `src/lib/roles.ts` — client-safe role ranking + permission helpers
- `src/lib/theme.ts` — accent presets, theme cookies (client-safe)
- `src/lib/types.ts` — shared types
- `src/components/AppShell.tsx` — workspace-aware nav + switcher + theme toggle
- `src/components/KanbanBoard.tsx` — drag-and-drop board (client)
- `src/components/AppearanceForm.tsx` — theme/accent picker (client)
- `src/app/w/[id]/**` — workspace-scoped pages
- `supabase/migrations/20260717_flexiflow.sql` — customization schema

## Conventions

- Server components fetch via `getShellData(workspaceId)`; if it returns null,
  redirect to `/workspaces` (or `/login` when unauthenticated).
- Mutations go through server actions that call `requireWorkspaceRole(id, min)`
  for authorization. Roles: OWNER > ADMIN > MANAGER > MEMBER > GUEST.
- Statuses are per-workspace rows referenced by `tasks.status_id` — never
  hardcode status strings in UI.
- Theme/accent persist in `user_prefs` and mirror to cookies for flash-free SSR
  in `src/app/layout.tsx`.

## Do not

- Hardcode secrets, cohort size, or status enums.
- Import `firebase-admin`; this app uses Supabase.
- Put `SUPABASE_SERVICE_ROLE_KEY` in client bundles (server-only in `db.ts`).
- Use `next/font/google` at build time — the design uses a system font stack so
  builds don't depend on network font fetches.
