# Project 1 Submission — @ramyatolety

Summer Pilot 2026, Project 1 — PM platform ("Waypoint").

## Production URL

https://pm-ramyatolety.vercel.app

Build repo: https://github.com/RamyaTolety/pm-ramyatolety

**Reviewer login** (no signup needed):
```
Email:    ramyat500+test1@gmail.com
Password: testpass123
```
This account already owns a project with tasks in each status, a due date, a comment thread, and a checklist, so the board, filters, Focus widget, and Insights view all have real data on first load.

## Setup steps verified on fresh clone

1. `git clone https://github.com/RamyaTolety/pm-ramyatolety.git && cd pm-ramyatolety`
2. `npm install`
3. Create a Firebase project (Authentication → Email/Password, Firestore in production mode), deploy `firestore.rules`, copy the web config into `.env.local` (see `.env.local.example`)
4. `npm run build` then `npm run dev` → http://localhost:3000

Verified by actually doing it: cloned into an isolated scratch directory, ran `npm install` clean, copied a working `.env.local`, ran `npm run build` (passed), then `npm run dev` and confirmed the server returns HTTP 200 with the correct page title before tearing the clone down.

## Architecture summary

- **Frontend:** Next.js 16 App Router + TypeScript + Tailwind CSS v4
- **Auth:** Firebase Authentication (email + password)
- **Database:** Firestore, realtime via `onSnapshot` listeners — board and dashboard update live across users with no refresh
  - `projects/{projectId}` — name, description, owner, memberEmails, archived, createdAt
  - `projects/{projectId}/tasks/{taskId}` — title, description, status, assigneeEmail, dueDate, labels, createdAt, updatedAt
  - `tasks/{taskId}/comments/{commentId}` and `tasks/{taskId}/checklistItems/{itemId}` as subcollections
- **Access control:** `firestore.rules` restricts all reads/writes on a project (and its tasks/comments/checklist items) to users whose email is in that project's `memberEmails`. `ownerEmail` is immutable on update — found and fixed during self-review: without that, any member could reassign ownership to themselves and then delete the project, since delete only checks `ownerEmail`.
- **Hosting:** Vercel

## Motivation / engagement design notes

- **Focus widget:** dashboard surfaces the single most urgent task assigned to you (earliest due date first) plus a "shipped this week" count — one clear next action instead of scanning three kanban columns.
- **Progress visibility:** per-project completion bars, a per-project Insights page (7-day completion chart, average cycle time, per-assignee breakdown), and a live incomplete-task count badge next to "My Tasks" in the nav.
- **Signals that make people want to ship:** a confetti celebration when a task is marked done, colored due-date urgency badges (overdue/due-soon), and colored task labels (Trello-style chips) for at-a-glance triage.
- **Low-friction workflow:** drag-and-drop cards between kanban columns, a `⌘K` command palette to jump between projects, a keyboard shortcut (`n`) for quick task creation, project templates (Sprint Board / Bug Tracker) that pre-populate starter tasks, and subtask checklists with a progress bar.
- **Collaboration:** comment threads per task, member management by email, post-creation project editing.

## Known limitations

Stated plainly rather than left for a reviewer to find:

- **No auto-deploy on push.** Vercel's GitHub integration reports "already connected" but no webhook actually exists on the repo (confirmed via the GitHub API) — deploys currently run manually via `vercel --prod`.
- **No notifications or email digests.** Assignment and due-date awareness is in-app only (Focus widget, badges); nothing pings you outside the app.
- **No points/leaderboard gamification** — a deliberate omission: ranking risks demotivating whoever's behind, which cuts against the cohort's actual goal.
- **Drag-and-drop is unverified by automated browser testing.** It's standard HTML5 `dragstart`/`dragover`/`drop`, but browser-automation tools can't simulate native drag events, so this was checked by code review, not a live automated test. The status dropdown is a fully-tested fallback for the same action.
- **Any project member can remove any other member** from `memberEmails` (including the owner) — a collaborative-editing tradeoff, not currently restricted to the owner. `ownerEmail` itself is protected (see Architecture).
- **Any project member can delete any task**, not just their own or ones they created — intentional for a small trusted cohort team, but worth knowing.

## Agent usage summary

- **Research:** Read the cohort's own curriculum docs directly from `rogerSuperBuilderAlpha/hult-cohort-program` (onboarding, `requirements.md`, `review-rubric.md`, `governance/winner-selection.md`, `assessment/peer-review-system.md`) to determine actual scope, since the program's marketing pages and curriculum repo disagreed on what Week 1 covered. Also reviewed already-merged peer submissions to calibrate scope and find real gaps (a project-ownership security bug, a missing "clear next action" widget, no documented reviewer login) before finishing.
- **Development:** Built the full Next.js + Firebase app end-to-end via Claude: auth, projects/tasks CRUD, kanban board with drag-and-drop, due dates, colored labels, comments, subtask checklists, a command palette, a Focus/momentum widget, a per-project Insights view, project templates, and a confetti completion celebration. Deployed to Vercel and wired up Firestore security rules.
- **QA:** Live browser verification after every change (signup/login, project and task CRUD, status transitions, comments, checklists, filters, command palette navigation) via browser automation against both localhost and the production URL; a genuine fresh-clone install+build+boot test in an isolated directory; a self-review pass against three merged peer submissions that caught and fixed the ownership security bug described above.

## Test plan

- [x] Build repo public at `RamyaTolety/pm-ramyatolety`
- [x] Production URL returns 200
- [x] Fresh clone → install → build → boot verified in an isolated directory
- [x] Auth signup/login working on production
- [x] End-to-end: sign up → create project → create + assign task with due date and labels → drag between columns / change status → mark done → comment → checklist
- [x] Firestore security rules deployed; ownership-hijack vector found and fixed
- [x] Cross-project My Tasks view with project/status/assignee filters
