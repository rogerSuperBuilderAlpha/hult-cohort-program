# Project 1 Submission — @lvcasmadeit

Summer Pilot 2026, Project 1 — **Mast** (team production management for the cohort).

**Production URL:** https://mast-six.vercel.app  
**Repo:** https://github.com/lvcasmadeit/Mast

## Architecture summary

Mast is a Next.js 16 (App Router) + React 19 + TypeScript app deployed on Vercel. Clerk handles auth and organizations; Neon Postgres stores projects, todos, goals, status updates, and GitHub installation metadata via Drizzle ORM. Server Actions back the project list, Kanban todos, goals board, status panel, and calendar view. A GitHub App powers org-scoped repo installs, project↔repo linking, and webhook-driven activity notes on linked projects.

## Motivation / engagement design notes

Progress visibility is the core loop: traffic-light status chips and short status labels on every project card, todo completion percentages with progress bars, and a project summary that surfaces recent human status updates alongside GitHub activity. Empty states and CTAs point to the next action (create a project, add a todo, post a status) so teams always see direction and speed without gamification or leaderboards.

## Known limitations

- GitHub webhooks require a public deploy URL and configured app credentials; local dev can install/link repos with webhooks disabled.
- Webhook feed covers pull request and issue events only (no push events yet); todos link to GitHub URLs manually rather than syncing issues/PRs.
- No email/push notifications, realtime multi-user sync, or assignee picker backed by a verified org member directory.
- Not load-tested at 30+ concurrent accounts; architecture supports Clerk orgs but cohort-scale signup has not been exercised end-to-end.

## Setup steps verified on fresh clone

See PR description for the full verified setup checklist.

## Agent usage summary

Built iteratively with Cursor Agent across research, development, QA, and deployment — scaffolding the Next.js app, Clerk/Neon/Drizzle integration, GitHub App install flow, calendar/goals features, security hardening, and Vercel production deploy.
