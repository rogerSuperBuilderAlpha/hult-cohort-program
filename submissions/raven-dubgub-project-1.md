# Project 1 Submission - @raven-dubgub

**Joshua Scotland** · Hult Cohort Developer Program · Summer 2026 · Project 1 (PM platform)

**Production URL:** https://pm-raven-dubgub.vercel.app  
**Repo:** https://github.com/RAVEN-dubgub/pm-RAVEN-dubgub

## What this PM app brings to the table

Most cohort PM tools stop at checklists. This one is built for **visible cohort momentum** and **peer accountability**: who is shipping, what is blocked, what peers assigned to you, and how the whole cohort is progressing week over week.

The differentiator is a **holographic HUD workspace** (neon ring navigation, orbital project/task layouts, focus projection panels) paired with **PMP-inspired cohort habits** (at-risk flags, weekly updates, standup check-ins, definition of done) and a **Task Coach** that turns any focused task into a paste-ready Cursor prompt plus git/PR steps. The goal is not solo task tracking. It is a shared cockpit where the cohort can see progress, unblock each other, and ship with the same Cursor + GitHub workflow we use in the program.

## Feature highlights

- **Holographic HUD UI** - reactive ring navigation (Dashboard / Projects / Tasks), orbital constellation for projects, task orbit view, focus projection (no overlapping tiles when zoomed in)
- **Cohort PM core** - projects, tasks, assignees, priority, blockers, list + kanban board, filters (project, assignee, status, priority, archived)
- **Motivation layer** - cohort completion %, active members, peer-assigned tasks, recent wins feed, onboarding checklist, overdue alerts, per-project progress bars
- **PMP habit nudges** - at-risk project flag + notes, weekly cohort update (stale > 7 days), standup check-in on in-progress tasks (stale > 2 days), definition of done per task
- **Task Coach** - template-based plan generator (no external AI key): tips, done-when checklist, copy-ready Cursor prompt, branch name, commit message, PR title/body; reads project GitHub repo URL when set
- **Auth + deploy** - email/password JWT sessions, PostgreSQL via Prisma on Neon, HTTPS on Vercel
- **Recent polish** - delete tasks/projects, accurate progress metrics after deletes, assignee pills limited to real cohort members with visible tasks, archive removes projects from active orbit immediately

## Architecture summary

Next.js 16 (App Router) + TypeScript + Tailwind. API routes under `/api/auth`, `/api/projects`, `/api/tasks`, `/api/metrics`, `/api/tasks/[id]/coach`. Prisma ORM to PostgreSQL (Neon). JWT httpOnly cookie auth. Client HUD built from custom components (`holographic-ring-hud`, `project-hud-layout`, `task-hud-view`, `task-coach-panel`) with route-aware neon theming.

```
Browser -> Next.js (Vercel) -> Prisma -> PostgreSQL
                |
         JWT session (email/password)
```

Data model: **User**, **Project** (owner, atRisk, weeklyUpdate, githubRepoUrl), **Task** (status, priority, assignee, dueDate, blockedBy, definitionOfDone, checkInNote).

## Motivation / engagement design notes

Research-backed UX choices (progress visibility, peer accountability, autonomy):

- **Cohort momentum hero** - cohort-wide completion % and active shippers, not a private todo list
- **Your contribution panel** - personal tasks done + share of cohort completions
- **Peer accountability** - "From [name]" on peer-assigned tasks; nudge when peer work is unstarted
- **Recent cohort wins** - live feed of tasks the team just completed
- **PM habit nudges** - weekly update + standup reminders inspired by r/PMP community habits (proactive risk comms, standups, definition of done)
- **At-risk projects panel** - early escalation visible to the whole cohort
- **Task Coach loop** - focus task -> Get Cursor plan -> paste in Cursor -> push PR (matches how we actually ship in the cohort)

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/RAVEN-dubgub/pm-RAVEN-dubgub.git
cd pm-RAVEN-dubgub
npm install
cp .env.example .env
# Set DATABASE_URL (Neon pooled) and AUTH_SECRET (32+ chars)
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000 -> Sign up -> create project -> add task -> assign a peer.

Production (Vercel): set `DATABASE_URL` + `AUTH_SECRET`, deploy, then run `DATABASE_URL="..." npx prisma migrate deploy` against prod once.

Validation gate used before push:

```bash
npm run lint
npm run build
```

Staff smoke account (optional): `staff-review@hult-cohort.test` (password shared in Discord `#setup-verification` during review week).

## Known limitations

- Email/password only (no OAuth yet)
- No in-app notifications or task comments
- No GitHub issue linking (stretch for later weeks)
- Task Coach is template-based, not LLM-backed (predictable, no API key, less adaptive than live AI)
- Requires manual `prisma migrate deploy` after first Vercel deploy
- Not load-tested at 30+ simultaneous accounts yet (architecture supports it; scale exercise pending)

## Agent usage summary

Built iteratively with **Cursor Agent** (Claude):

- Read cohort curriculum requirements from `rogerSuperBuilderAlpha/hult-cohort-program`
- Scaffolded Next.js + Prisma + PostgreSQL stack, auth, CRUD APIs, dashboard metrics
- Implemented holographic HUD orbit UI, PMP habit features, and template Task Coach
- Human steps: Neon database, Vercel env vars, production migration, this submission PR

Agent handled most implementation; human verified deploy, sens-checked UX in browser, and ran lint/build before each push.
