# INITIARA

**The Gateway to Project Success**

Initiara is a web-based initiative tracking and engagement platform for the Hult Cohort Program. It combines an Executive Summary health dashboard, per-initiative task tables, multi-user authentication, and Supabase-backed persistence so each participant can create projects, assign work to team members, and monitor progress over time.

## Overview

Initiara provides a centralized space for users to:

- Start and manage initiatives (projects) with create, rename, archive, and restore
- Track tasks with status, due dates, assignees, and comments
- Maintain a personal team roster and assign tasks from a dropdown
- Filter tasks by status, assignee, and project
- Monitor initiative health at a glance in the Executive Summary
- Sign in so data persists across browsers and sessions via Supabase

The main dashboard (`/`) is the operational hub: **Team Members**, **Executive Summary**, and **Initiative Summary** task tables. Sidebar routes for cohort engagement (motivators, performers, action items) are scaffolded placeholders for future phases.

---

## Features

### Initiative Management

- Create new initiatives from **Start New Initiative**
- Rename initiatives inline from the Executive Summary (**Edit**)
- Archive initiatives by row number (tasks preserved; hidden from active views)
- Restore or permanently delete archived initiatives
- Jump from Executive Summary rows to matching task tables

### Task Management

- Per-initiative task tables with sub-task support
- Three status values: **To Do**, **In Progress**, **Done**
- Fields: description, status, date due, assignee, comments
- Add and delete tasks (minimum one row per initiative)
- Filter tasks by **status**, **assignee**, and **project** (initiative)

### Team Members & Assignment

- **Team Members** panel on the main dashboard
- Add and remove names from a personal roster
- Assign tasks via assignee dropdown (roster-driven, not free text)

### Executive Summary & Health

- Progress bars and overall health indicators per initiative
- Colour-coded health legend (red → green by completion %)
- Row count grows with the number of active initiatives

### Personal Progress Tracking

- Monitor individual status and performance (placeholder route)
- Review personal initiative progress on the main dashboard when signed in

### Cohort Visibility

- View overall cohort status (placeholder route)
- Compare progress across participants (future shared workspace)

### Action Planning

- Review action items (placeholder route)
- Focus on next steps via Initiative Summary task tables

### Engagement & Motivation

- Motivate fellow participants (placeholder route)
- Recognize top performers and top motivators (placeholder routes)
- Encourage positive peer engagement (future phase)

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
│   └── page.tsx
│
├── initiatives/[slug]/
│   ├── page.tsx
│   └── not-found.tsx
│
├── my-status/                  # placeholder
├── cohorts-status/             # placeholder
├── action-items/               # placeholder
├── motivate-a-friend/          # placeholder
├── top-ten-performers/         # placeholder
└── top-ten-motivators/         # placeholder

components/
├── DashboardPage.tsx           # Shell: team roster + executive + initiative summary
├── Dashboard.tsx               # Executive Summary (edit, archive)
├── InitiativeSummary.tsx       # Task tables + filters
├── TeamMembersPanel.tsx
├── TaskFilterBar.tsx
└── ...

hooks/
├── useInitiatives.ts
├── useInitiativeTasks.ts
├── useTeamMembers.ts
└── useCohortSubmissions.ts

lib/
├── initiatives.ts
├── initiativeTasks.ts
├── teamMembers.ts
├── taskFilters.ts
└── supabase/                   # clients, repositories, middleware

supabase/
└── schema.sql                  # Tables + RLS (run in Supabase SQL Editor)
```

---

## Available Routes

| Route | Description |
|---------|------------|
| `/` | Main dashboard (Team Members, Executive Summary, Initiative Summary) |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/start-new-initiative` | Create a new initiative |
| `/initiatives/[slug]` | View initiative details |
| `/my-status` | Personal progress dashboard *(placeholder)* |
| `/cohorts-status` | Cohort performance overview *(placeholder)* |
| `/action-items` | Action item management *(placeholder)* |
| `/motivate-a-friend` | Peer encouragement and engagement *(placeholder)* |
| `/top-ten-performers` | Top performer leaderboard *(placeholder)* |
| `/top-ten-motivators` | Top motivator leaderboard *(placeholder)* |

---

## Installation

### Clone the Repository

This submission lives in the Hult cohort monorepo. Clone your fork and open the submission directory:

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

Fill in Supabase values (see [DEPLOY.md](./DEPLOY.md)), then run the full contents of `supabase/schema.sql` in your Supabase **SQL Editor** (safe to re-run; includes Phase B migrations for `archived` and `team_members`).

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

---

## Fresh Clone Verification

The application setup was verified using a fresh clone of the submission directory within the cohort fork.

Commands executed:

```bash
git clone https://github.com/Studmuffin01/hult-cohort-program.git
cd hult-cohort-program/submissions/studmuffin01-project-1
npm install
cp .env.example .env.local
# configure Supabase + run schema.sql
npm run build
```

Results:

- Repository cloned successfully.
- Dependencies installed successfully.
- Production build succeeds when Supabase env vars are set.
- No blocking installation issues encountered when `schema.sql` has been applied.

Note: Production builds may encounter certificate-related issues in environments that restrict external font downloads from Google Fonts.

---

## Authentication & persistence

- **Sign up** at `/auth/signup` — confirmation email required (see [DEPLOY.md](./DEPLOY.md) for redirect URLs).
- **Sign in** at `/auth/login` — server-side auth routes; redirects to `/` after success.
- **Sign out** — header button on main pages when authenticated.
- **Logged in:** initiatives, tasks, team members, and cohort row data sync to Supabase (scoped per user id).
- **Logged out:** the same features fall back to browser `localStorage`.
- **First login:** local data migrates to Supabase when the remote account has no existing rows.

### Supabase tables

| Table / key | Purpose |
|-------------|---------|
| `custom_initiatives` | User-created initiatives (`slug`, `title`, `deadline`, `archived`) |
| `user_app_data` → `initiative_tasks` | Task rows keyed by initiative slug |
| `user_app_data` → `team_members` | Assignee roster |
| `user_app_data` → `cohort_submissions` | Cohort checkbox + name rows |

Executive Summary and Initiative Summary stay linked by **initiative `slug`** (not a separate foreign key).

Task tables use **To Do**, **In Progress**, and **Done**, with assignees chosen from the **Team Members** roster dropdown.

---

## Design Philosophy

Initiara was built around several key principles:

### Visibility

Users should be able to quickly understand progress, status, and priorities — Executive Summary health colours and progress bars surface initiative status at a glance.

### Accountability

Making progress visible encourages follow-through; task assignees and due dates support ownership.

### Recognition

Highlighting top performers and top motivators reinforces positive behaviors *(leaderboard routes planned)*.

### Community Engagement

Motivation and peer support features encourage participants to actively support one another *(placeholder routes)*.

### Simplicity

Information is organized into focused sections — one dashboard for daily work, sidebar for future engagement features.

---

## Known Limitations

- Data is **per authenticated user**, not a shared cohort workspace (two users do not see each other's initiatives).
- Sidebar routes (`/my-status`, `/action-items`, `/top-ten-performers`, etc.) are placeholders without full functionality.
- Initiative **deadline** is stored but not editable in the UI (defaults to `TBD`).
- Cohort completion % counts rows with any checkbox ticked or a non-empty name (see `lib/cohortSubmissions.ts`).
- Limited automated testing coverage.
- Production builds may be affected by environments that block font CDN downloads.

---

## Future Enhancements

- Shared cohort workspace (collaborative projects and roster)
- Full implementation of sidebar engagement routes
- Editable initiative deadlines
- Expanded leaderboard and collaboration features
- Automated test coverage for persistence and auth flows

---

## Deployment

The application is deployed on Vercel from the cohort fork. Configure Supabase env vars and auth redirect URLs using [DEPLOY.md](./DEPLOY.md).

Push updates to your fork:

```bash
scripts/push-to-fork.bat      # general submission push
scripts/push-phase-b.bat      # same flow with Phase B commit message (if needed)
```

**Production URL:**

https://initiara-git-participants-summer26phase-1-project-b9933f-rawle.vercel.app

**Fork branch:**

`participants/summer26/phase-1-project-1/studmuffin01`

---

## Author

**Rawle Arneaud**

Project Submission for the Hult Cohort Program.
