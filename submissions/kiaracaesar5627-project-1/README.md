# FlexiFlow — customizable project management (Project 1)

A fully customizable project-management platform for the Hult Cohort Developer
Program Summer Pilot 2026. Instead of forcing one rigid workflow, FlexiFlow lets
each team build **workspaces** and tailor statuses, labels, custom fields, views,
roles, and automations to how they actually work.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://pilot-hult-pm.vercel.app

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** on **Vercel**
- **Supabase** (Postgres + service-role server access)
- Email + password auth (bcrypt + signed HTTP-only JWT cookies via `jose`)
- No client-side data libraries — all data access is server-side (Server Actions)

## What FlexiFlow does

Customization is the product. Every workspace is independent.

- **Workspaces** — create as many as you like; each has its own team, brand
  color, and feature set.
- **Roles** — Owner, Admin, Manager, Member, Guest, enforced in the UI and in
  server actions (`src/lib/roles.ts`, `requireWorkspaceRole`).
- **Projects** — unlimited per workspace.
- **Custom statuses** — define your own workflow stages with colors; mark which
  ones count as "done". No hardcoded TODO/IN_PROGRESS/DONE.
- **Custom labels** — color-coded tags.
- **Custom fields** — text, number, date, dropdown, or checkbox attributes on
  tasks.
- **Views** — List, Board (drag-and-drop Kanban), and Table per project, plus a
  workspace **Calendar** by due date.
- **Dashboard** — analytics widgets: tasks by status, open/completed counts,
  weekly throughput, personal queue, and recent activity.
- **Feature toggles** — enable only the features a workspace needs.
- **Automations** — "when a task enters status X, notify the creator/assignee".
- **Notifications** — in-app inbox with unread counts.
- **Activity history** — per-workspace change feed.
- **Theme personalization** — light/dark + accent color, persisted per user and
  applied flash-free via cookies.
- **Comments** — discussion threads on tasks.

### Stubbed (clearly marked "Coming soon", not faked)

File sharing, external integrations (Slack/GitHub/Google Calendar/…), AI assist,
and Timeline/Gantt appear as roadmap placeholders in workspace settings.

## Fresh-clone setup

```bash
cd submissions/kiaracaesar5627-project-1
cp .env.example .env
# Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET
# Apply migrations in the Supabase SQL editor, in order:
#   supabase/migrations/20260713_init.sql
#   supabase/migrations/20260717_flexiflow.sql
npm install
npm run db:seed
npm run build
npm run dev
```

Open http://localhost:3000

### Seed accounts

| Role   | Email                     | Password      |
| ------ | ------------------------- | ------------- |
| Owner  | `demo@flexiflow.test`     | `DemoPass1!`  |
| Member | `sam@flexiflow.test`      | `SamPass1!`   |
| Guest  | `guest@flexiflow.test`    | `GuestPass1!` |

The seed creates a **Product Studio** workspace with statuses, labels, a Priority
custom field, a project, tasks across the board, and one automation. Or register
any new account from `/register` and build your own workspace.

## Architecture

```
Browser → Next.js (Vercel)
            ├─ Server Actions (auth, workspaces, projects, tasks, settings)
            ├─ JWT session cookie (AUTH_SECRET)
            ├─ Role guards (requireWorkspaceRole)
            └─ @supabase/supabase-js (service role) → Supabase Postgres
```

Routes:

- `/` landing · `/login` · `/register` · `/account` (appearance) · `/notifications`
- `/workspaces` — hub
- `/w/[id]` — dashboard · `/w/[id]/projects` · `/w/[id]/projects/[pid]` (views)
- `/w/[id]/tasks/[taskId]` — detail (labels, custom fields, comments)
- `/w/[id]/members` · `/w/[id]/calendar` · `/w/[id]/settings`

## Data model

Schema lives in `supabase/migrations/`:

- `20260713_init.sql` — base `users` / `projects` / `tasks`
- `20260717_flexiflow.sql` — `workspaces`, `workspace_members`, `statuses`,
  `labels`, `custom_fields`, `task_labels`, `task_field_values`, `comments`,
  `activity`, `notifications`, `automation_rules`, `user_prefs`, plus the
  `projects.workspace_id` / `tasks.status_id` extensions.

RLS is enabled on every table; the app connects with the Supabase service role
on the server only — never exposed to the browser.

## Deploy (Vercel)

1. Vercel project rooted at `submissions/kiaracaesar5627-project-1`.
2. Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`.
3. Build command: `next build` (default).

## Known limitations

- Automations currently support notify-on-status-change actions only.
- Advanced items above are intentional stubs, not integrations.
- Auth is email/password only (no OAuth).

## License

MIT (inherits cohort program license context)
