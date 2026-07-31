# INITIARA

**The Gateway to Project Success**

Initiara is a web-based initiative tracking and engagement platform. It combines an Executive Summary health dashboard, user-defined initiatives (create, rename, archive), per-initiative task tables with roster-based assignees and filtering, a Team Members roster, peer motivation tools, an AI portfolio coach, multi-user authentication, and Supabase-backed persistence so each signed-in user can create projects, assign work, and monitor progress across sessions.

**Reviewer checklist:** see [REVIEWER_RUBRIC.md](./REVIEWER_RUBRIC.md) for item-by-item mapping to the Phase 1 rubric.

## Overview

Initiara provides a centralized space for users to:

- Start and manage initiatives (create, rename, archive, restore, or delete)
- Track tasks with status, due dates, assignees, and task notes
- Maintain a structured team roster and assign tasks from a dropdown
- Filter tasks by status, assignee, and project
- Monitor initiative health, deadlines, and workload in a compact eight-column Executive Summary
- Review member-specific progress, open action items, and completion leaderboards from the **Command Center** sidebar
- Send motivational or congratulatory messages to team members and keep a personal sent-message log
- Ask the **AI Assistant** natural-language questions about overdue work, priorities, initiative health, and team workload
- Sign in so data persists across browsers and sessions via Supabase

The main dashboard (`/`) is the operational hub: **Executive Summary** and **Initiative Summary** task tables. Team management, engagement tools, and the AI Assistant live in the **Command Center** sidebar on every authenticated page.

---

## Features

### Initiative Management

- Create new initiatives from **Start New Initiative** (label: **Title of Your Initiative**)
- Rename initiatives inline from the Executive Summary (**Edit**)
- Archive initiatives by row number (tasks preserved; hidden from active views)
- Restore or permanently delete archived initiatives
- Jump from Executive Summary rows to matching task tables via initiative title links

### Task Management

- Per-initiative task tables with **sub-task** support (indented rows)
- Three status values: **To Do**, **In Progress**, **Done**
- Fields: description, status, date due, assignee, comments
- **Comments** are for important task notes — not used for leaderboards or social tracking
- Add and delete tasks (minimum one row per initiative)
- Filter tasks by **status**, **assignee**, and **project** (initiative)
- Debounced persistence (400ms) with blur flush so edits are not lost on navigation
- **Sub-task due date roll-up:** when a sub-task due date exceeds its parent, an inline warning offers to adjust the parent due date (confirm to roll up; cancel or blur reverts the sub-task date)
- Initiative Summary uses a compact layout; multiple initiatives display in a two-column grid on wide screens

### Team Members & Assignment

- **Team Members** page (`/team-members`) from the Command Center
- Roster fields: **First Name**, **Last Name**, **Department**, **Email**
- Display name (`First Last`) drives assignee matching in task tables
- Select a row and **Remove Member** (with confirmation)
- Legacy single-name records migrate automatically on load
- Assign tasks via assignee dropdown (roster-driven)

### Executive Summary

Compact eight-column portfolio view per initiative:

| Column | Meaning |
|--------|---------|
| INITIATIVE | Title (link scrolls to task table) |
| Progress To Date | % of active tasks marked Done |
| Open Tasks | Active tasks not marked Done |
| Overdue Tasks | Open tasks past due date |
| Deadline | Latest task due date (includes year) |
| Days Left | Countdown to that deadline |
| Overall Health | Schedule-aware health indicator (On schedule / At risk / Overdue) |
| Owner | Primary assignee on open work, or **Multiple** with hover detail |

Initiative deadline is derived automatically from task due dates (not manually edited).

### Command Center (sidebar)

Navigation items:

| Route | Label | Purpose |
|-------|-------|---------|
| `/start-new-initiative` | Start New Initiative | Create a new initiative |
| `/team-members` | Team Members | Manage roster (add / remove) |
| `/member-status` | Member Status | Per-member stats, initiative breakdown, assigned tasks |
| `/action-items` | Action Items | Open tasks across all initiatives (overdue highlighted) |
| `/motivate-a-friend` | Motivate A Friend | Send encouragement or congratulations tied to a member's tasks |
| `/top-performers` | Top Performers | Leaderboard by completed assigned tasks |

Sidebar pages share a compact panel layout (`SidebarPageFrame`) with page titles aligned to the main content column beside the Command Center. On viewports below `lg` (1024px), the Command Center collapses into a slide-out drawer opened from the **Command Center** button in the page header (next to theme toggle). The sidebar uses an army-green / olive palette; the main dashboard header shows the gateway image beside the INITIARA title. Dark mode adds stronger contrast between the olive sidebar and slate main panels.

#### Motivate A Friend

- Select a **team member** and one of their tasks (open or done)
- Suggested messages adapt to task status: **Motivational** (open work) or **Congratulatory** (Done)
- Edit the message, insert emojis at the cursor, and send via **Email Message** (`mailto:` using the member's email from Team Members)
- **Sent Messages** log records recipient, message type, task, preview, and timestamp (browser `localStorage`; personal to this device/browser)

#### AI Assistant

Built-in portfolio coach at the bottom of the Command Center sidebar. It reads live dashboard data (initiatives, tasks, assignees, health metrics) and answers short questions without an external API key.

**Suggested prompts:**

- What's overdue?
- What should I focus on?
- Summarize my portfolio
- Who has the most open work?

**Also supports:** initiative drill-down (mention an initiative title), member workload (mention a name), top-performer summary, and a help list of example questions.

Implementation: `lib/assistantPortfolioContext.ts` builds a snapshot; `lib/assistantCoach.ts` detects intent and returns actionable plain-language answers.

---

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Development Tools

- ESLint
- PostCSS

### Backend & Auth

- Supabase (PostgreSQL + Auth)
- Server API routes for auth and dashboard data (`/api/auth/*`, `/api/dashboard/*`)
- Per-user persistence when signed in (Row Level Security)
- Email signup with confirmation
- Debounced sync (400ms) for tasks, initiatives, and team members

### Deployment

- Vercel — see [DEPLOY.md](./DEPLOY.md) for env vars, Supabase URL configuration, and fork push workflow

---

## Application Structure

```text
app/
├── globals.css
├── layout.tsx
├── page.tsx                    # Main dashboard entry
│
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/route.ts
│
├── api/
│   ├── auth/                   # login, signup, logout, resend
│   ├── dashboard/
│   │   ├── initiatives/        # GET + PATCH (title, archive)
│   │   ├── tasks/              # GET + PUT initiative_tasks
│   │   └── members/            # GET + PUT team_members
│   └── health/                 # Supabase connectivity check
│
├── start-new-initiative/
├── team-members/
├── member-status/
├── action-items/
├── motivate-a-friend/
├── top-performers/
├── top-ten-performers/         # legacy redirect → /top-performers
├── my-status/                  # legacy redirect → /member-status
└── initiatives/[slug]/         # redirect → dashboard anchor

components/
├── DashboardPage.tsx           # Executive Summary + Initiative Summary
├── Dashboard.tsx               # Executive Summary table
├── InitiativeSummary.tsx       # Task tables + filters
├── InitiativeTaskRow.tsx       # Task row + sub-task due date popover
├── SubTaskDueDateWarningPopover.tsx
├── AppSidebar.tsx              # Command Center nav + AI Assistant slot
├── AiAssistantPanel.tsx        # Portfolio coach UI
├── CommandCenterRow.tsx        # Sidebar + content row; SidebarDataProvider
├── sidebar/SidebarPageFrame.tsx
├── TeamMembersPage.tsx
├── TeamMembersPanel.tsx
├── MemberStatusPage.tsx
├── ActionItemsPage.tsx
├── MotivateAFriendPage.tsx
├── TopTenPerformersPage.tsx
└── ...

hooks/
├── useInitiatives.ts
├── useInitiativeTasks.ts
├── useTeamMembers.ts
├── useSidebarData.ts
├── SidebarDataProvider.tsx     # Shared data for sidebar pages + AI Assistant
├── useMotivationLog.ts         # Sent Messages log (localStorage)
└── useSupabaseUser.ts

lib/
├── initiatives.ts
├── initiativeTasks.ts
├── taskDueDates.ts               # Sub-task / parent due date roll-up logic
├── executiveSummaryMetrics.ts
├── initiativeDeadlines.ts
├── health.ts
├── sidebarStats.ts               # Member Status, Action Items, Top Performers
├── teamMembers.ts
├── motivationMessages.ts         # Suggested motivate-a-friend copy
├── motivationLog.ts              # Sent Messages persistence
├── assistantPortfolioContext.ts  # AI Assistant snapshot builder
├── assistantCoach.ts             # AI Assistant Q&A
├── navigation.ts
└── supabase/

supabase/
└── schema.sql                  # Tables + RLS (run in Supabase SQL Editor)
```

---

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Main dashboard (Executive Summary, Initiative Summary) |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/start-new-initiative` | Create a new initiative |
| `/team-members` | Manage assignee roster |
| `/member-status` | Task progress for a selected team member |
| `/action-items` | Open tasks across all initiatives |
| `/motivate-a-friend` | Peer encouragement / congratulations helper |
| `/top-performers` | **Top Performers** — completed-task leaderboard |
| `/top-ten-performers` | Legacy bookmark → redirects to `/top-performers` |
| `/initiatives/[slug]` | Redirects to dashboard section for that initiative |
| `/my-status` | Legacy bookmark → redirects to `/member-status` |

---

## Installation

### Clone the Repository

This submission lives in the Hult program monorepo. Clone your fork and open the submission directory:

```bash
git clone https://github.com/Studmuffin01/hult-cohort-program.git
cd hult-cohort-program/submissions/studmuffin01-project-1
```

### Install Dependencies

```bash
npm install
```

### Environment variables

```bash
cp .env.example .env.local
```

Fill in Supabase values (see [DEPLOY.md](./DEPLOY.md)), then run the full contents of `supabase/schema.sql` in your Supabase **SQL Editor** (safe to re-run; includes Phase B/C migrations for `archived`, `team_members`, and retired cohort data keys).

---

## Running the Application

### Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### Tests

```bash
npm test
```

Vitest covers task/member parsing, portfolio coach intents, request body limits, due-date health scoring, overdue detection, and unauthenticated dashboard API responses (`401`).

---

## Fresh Clone Verification

The application setup was verified using a fresh clone of the submission directory.

```bash
git clone https://github.com/Studmuffin01/hult-cohort-program.git
cd hult-cohort-program/submissions/studmuffin01-project-1
npm install
cp .env.example .env.local
# configure Supabase + run schema.sql
npm test
npm run lint
npm run build
```

Results:

- Repository cloned successfully.
- Dependencies installed successfully.
- `npm test` runs Vitest unit tests (parsers, health/overdue logic, API 401 guards, readJsonBody limits).
- Production build succeeds when Supabase env vars are set.
- No blocking installation issues encountered when `schema.sql` has been applied.

Note: Production builds may encounter certificate-related issues in environments that restrict external font downloads from Google Fonts.

---

## Authentication & persistence

- **Sign up** at `/auth/signup` — confirmation email required (see [DEPLOY.md](./DEPLOY.md) for redirect URLs).
- **Sign in** at `/auth/login` — server-side auth routes; redirects to `/` after success.
- **Sign out** — header button on main pages when authenticated.
- **Logged in:** initiatives, tasks, and team members sync to Supabase (scoped per user id).
- **Logged out:** the same features fall back to browser `localStorage`.
- **First login:** local data migrates to Supabase when the remote account has no existing rows.

### Supabase tables

| Table / key | Purpose |
|-------------|---------|
| `custom_initiatives` | User-created initiatives (`slug`, `title`, `deadline`, `archived`) |
| `user_app_data` → `initiative_tasks` | Task rows keyed by initiative slug |
| `user_app_data` → `team_members` | Assignee roster |

Executive Summary and Initiative Summary stay linked by **initiative `slug`**. Task tables use **To Do**, **In Progress**, and **Done**, with assignees chosen from the **Team Members** roster.

### localStorage keys (logged-out fallback and client-only data)

| Key | Purpose |
|-----|---------|
| `initiara-custom-initiatives` | User-created initiatives |
| `initiara-initiative-tasks` | Task tables per initiative |
| `initiara-team-members` | Assignee roster |
| `initiara-theme` | Dark / light preference |
| `initiara-motivation-log` | Sent Messages log from Motivate A Friend (not synced to Supabase) |

---

## Design Philosophy

### Visibility

Executive Summary columns surface progress, workload, schedule risk, and ownership at a glance. Member Status and Action Items drill into the same data from a people-first and urgency-first angle.

### Accountability

Task assignees and due dates support clear ownership. Overdue tasks are highlighted in Action Items and surfaced by the AI Assistant.

### Recognition

**Top Performers** ranks completed assigned tasks. **Motivate A Friend** supports timely encouragement and congratulations without treating task comments as a social metric.

### Simplicity

One dashboard for daily work; Command Center sidebar for roster management, member views, engagement, and portfolio Q&A. The AI Assistant synthesizes data you already track — it does not introduce a separate analytics layer.

---

## Known Limitations

- Data is **per authenticated user**, not a shared workspace (two users do not see each other's initiatives).
- **Top Performers** and AI Assistant answers reflect the **current user's** task data only.
- **Sent Messages** (Motivate A Friend) persist in **localStorage** on the current browser — not shared across devices or users.
- **Email Message** opens the system mail client (`mailto:`); the app does not confirm delivery.
- There is **no cross-user motivational messaging leaderboard** — the app cannot reliably track who sent messages to whom across the team.
- **Top Ten Motivators** (comment-based leaderboard) was removed; task **Comments** are for notes, not engagement scoring.
- `/initiatives/[slug]` detail pages are not implemented (redirect to dashboard anchor).
- AI Assistant uses **rule-based intent matching** on live dashboard data, not an external LLM API.
- Vitest unit tests cover parsers, health/overdue logic, API auth guards, and request body limits; no full E2E suite.
- Production builds may be affected by environments that block font CDN downloads.

---

## Future Enhancements

- Shared multi-user workspace (collaborative projects and roster visible to a team)
- Supabase sync for sent motivational messages (with sender / recipient metadata)
- Optional LLM backend for richer AI Assistant answers (snapshot context is ready)
- Initiative detail pages at `/initiatives/[slug]`
- In-app notifications or delivery tracking for peer messages
- End-to-end (Playwright/Cypress) tests for auth and persistence flows

---

## Deployment

The application is deployed on Vercel from the program fork. Configure Supabase env vars and auth redirect URLs using [DEPLOY.md](./DEPLOY.md).

Push updates to your fork:

```bash
scripts/push-to-fork.bat
scripts/push-phase-b.bat      # alternate commit message template
```

PR body and submission docs: put the HTTPS URL on the line immediately after `## Production URL` (no link label like "Live Application" in between — the cohort parser stops there).

## Production URL

https://initiara-rawle.vercel.app

**Fork branch:**

`participants/summer26/phase-1-project-1/studmuffin01`

---

## Author

**Rawle Arneaud**

Project submission for the Hult Cohort Program.
