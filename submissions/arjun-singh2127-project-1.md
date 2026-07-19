# Project 1 Submission — @arjun-singh2127

Helm is a multi-tenant project-management platform for both personal and
corporate use. A Workspace is the flexible container: personal workspaces have a
single owner and a simplified UI, while corporate workspaces add members, roles,
and a Team tab. It covers the full PM baseline — accounts, projects, tasks with
assignment and a status workflow — plus budgeting, capital tracking, milestones,
and AI-assisted next steps.

## Production URL

**https://helm-web-neon.vercel.app**

- Source repository: https://github.com/arjun-singh2127/helm
- Health check: https://helm-web-neon.vercel.app/health returns `{"ok":true}`

Open registration is enabled — reviewers can create an account with any email +
password from the login screen, with no admin or database steps.

## Setup steps verified on fresh clone

```bash
git clone https://github.com/arjun-singh2127/helm.git
cd helm
npm install
cp .env.example .env          # Windows: copy .env.example .env
# set DATABASE_URL to a Postgres instance (local Docker or Neon)
npm run db:push               # create the schema
npm run db:seed               # optional demo data
npm run dev                   # API on :3000
npm run dev:web               # UI on :5173 (separate terminal)
```

Verified: the production deployment was built on Vercel, the schema was pushed
and seeded against the hosted Neon Postgres, `/health` returns 200 over HTTPS,
and email/password signup + login, project creation, and task create/assign/
status changes persist across refresh. The `npm install`, `prisma db push`, and
seed steps above were run successfully against the production database.

## Architecture summary

- **Frontend:** React 18 + Vite + TypeScript, React Router, TanStack Query.
  Static build served by Vercel's CDN.
- **Backend:** Express (mounted under `/api`) running as a single Vercel
  serverless function (`api/index.js` exports the Express app).
- **Auth:** JWT (bcrypt password hashing) with role-based access control ranked
  `viewer < member < admin < owner`, enforced per workspace.
- **Data:** PostgreSQL (Neon) via Prisma ORM. Serverless uses a pooled
  connection string.
- **Routing:** `vercel.json` rewrites `/api/*` and `/health` to the function and
  falls back to the SPA `index.html` for client routes.
- **Data model:** `User`–`Membership`–`Workspace`–`Project`–(`Task`,
  `Milestone`, `BudgetItem`, `Suggestion`, `Note`); `CapitalSource` belongs to a
  workspace and can be allocated to a project.
- **Key files:** `src/server.js` (routers), `src/middleware/rbac.js` (access
  control), `src/routes/tasks.js` (task lifecycle), `prisma/schema.prisma`.

## Motivation / engagement design notes

Helm keeps momentum visible and the next action obvious rather than using
gamified points:

- **Dashboard focus panel** for the selected project: task-progress bar with
  done/total %, budget spent vs planned, the next upcoming milestone, and the
  top AI insight — a single "where do I stand / what's next" view.
- **AI Insights** generate concrete next steps and risks (with a built-in
  heuristic fallback so it always works, even without an API key).
- **Kanban board** with one-click forward/back movement makes the next status
  transition the primary action; a list view and assignee/status filters keep
  large projects scannable.
- **Reports** surface completion %, on-track %, and budget/milestone burn so a
  team can see progress trends at a glance.
- **Light/dark theme** toggle for comfortable daily use.

## Known limitations

- Task assignment is scoped to workspace members; assign to peers by first
  adding them to a corporate workspace (Team tab), not by arbitrary email.
- No email/notification delivery yet — AI insights and due dates are in-app only.
- AI suggestions use built-in heuristics unless `OPENAI_API_KEY` is configured.
- No automated end-to-end (browser) tests; coverage is API-level plus a smoke
  test. Concurrent-user load testing not yet performed.
- Projects use a status lifecycle (planning/active/on_hold/done) and delete
  rather than a dedicated "archive" flag.

## Agent usage summary

- **Research:** the agent read the Project 1 requirements, review rubric,
  submission-branch conventions, and peer submissions to align scope.
- **Dev:** the agent migrated the app from SQLite to Postgres, added the Vercel
  serverless deployment config, implemented assignee/status task filters, a
  light/dark theme toggle, fixed the modal cancel-retains-text bug, removed
  pre-filled demo credentials, and added `LICENSE` (MIT) and `AGENTS.md`.
- **QA:** verified the production build, the public `/health` endpoint, and
  login/project/task persistence on the live deployment.
- **Human direction:** the builder chose Vercel + Neon, provisioned the database
  and environment variables, ran all shell/deploy commands, and made product
  and design decisions.
