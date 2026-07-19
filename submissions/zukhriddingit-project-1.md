# Project 1 Submission — @zukhriddingit

Momentum is a motivation-first project-management platform for small teams. Its
core loop is: create a task, choose today's Focus Task, complete it, earn
transparent points exactly once, extend a streak, receive supportive feedback,
and see project progress update.

## Production URL

**https://momentum-bay-two.vercel.app**

- Public source: https://github.com/zukhriddingit/Momentum
- Current source branch: https://github.com/zukhriddingit/Momentum/tree/main
- Project-archive fix PR: https://github.com/zukhriddingit/Momentum/pull/4

The deployed health endpoint returned HTTP 200 on July 18, 2026 with release
`0c72d4c`. Production GitHub OAuth and open password signup both work. A real
second GitHub account claimed a pending Hult cohort seat, completed its assigned
task, reloaded the persisted 20-point result, and received no duplicate reward
after reopen/recomplete.

The final baseline fix is also live. An owner archived a disposable Production
project; it disappeared from active workspace cards, project navigation,
dashboard progress, and selectors, while the old URL returned the same safe
unavailable page used for inaccessible resources. On an existing project where
the same account was only a member, neither Edit nor Archive was exposed.

## Setup steps verified on a fresh clone

The repository's clone/setup path was verified from a fresh clone earlier in
the release cycle. The full command below was rerun for the archive feature
content at `c1c00c8`; merge commit `c6b5f93` has the same application content,
and the deployed `0c72d4c` adds only hosted-verification documentation.

Requirements: Node.js 20.9 or newer, pnpm 11, Docker Desktop, and Chromium for
Playwright.

```bash
git clone https://github.com/zukhriddingit/Momentum.git
cd Momentum
pnpm install --frozen-lockfile
pnpm supabase:start
CI=true pnpm validate
```

The current release gate passed:

- formatting, ESLint, and strict TypeScript checks;
- 179 unit tests across 31 files;
- 110 pgTAP database assertions across six files;
- 44 database-backed integration tests across ten files;
- five primary Playwright flows, including mobile project archiving;
- deterministic demo provisioning verified twice;
- one guided-demo Playwright flow;
- tracked-source secret scan; and
- optimized Next.js Production build.

For local use, run `pnpm dev:local`, open `http://localhost:3000`, and follow the
README. Database test commands reset the local database and must not target a
shared or Production database.

## Architecture summary

- **Application:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind
  CSS, and accessible shadcn/ui-compatible Radix primitives.
- **Authentication and data:** Supabase Auth plus PostgreSQL migrations, RLS,
  constraints, triggers, and transaction-backed server services.
- **Authorization:** Validated server actions and services authorize workspace
  roles, assignments, task transitions, and project archiving. Trusted rewards
  are never calculated in the browser.
- **Cohort collaboration:** Owners/admins discover participants from the public
  Hult roster by GitHub handle. An unregistered participant receives a pending
  workspace seat and task assignment; verified GitHub OAuth atomically claims
  the seat on first sign-in.
- **Domain layer:** Pure TypeScript functions own rewards, streak transitions,
  achievements, deadline classification, and deterministic motivation-message
  selection outside React components.
- **Completion transaction:** The first completion atomically updates the task,
  writes an immutable point-ledger entry, updates the Focus Streak, unlocks
  achievements, snapshots encouragement, creates an in-app notification, and
  returns a persisted celebration receipt. Database identities make retries and
  reopen/recomplete flows idempotent.
- **Project lifecycle:** Owners/admins archive a project with one idempotent
  timestamp. Archived projects leave active reads and reject stale mutations;
  tasks, Focus history, completions, points, achievements, and notifications are
  preserved.
- **Operations:** Environment separation, health checks, safe request IDs,
  guarded demo scripts, deliberate migrations, source-secret scanning, and a
  hosted-readiness checklist.

## Motivation / engagement design notes

- Each person chooses at most one assigned Focus Task per workday, keeping the
  dashboard centered on today's work instead of enterprise administration.
- Effort determines transparent base points: Small 20, Medium 40, Large 70, and
  Extra Large 100. Finishing early and maintaining a Focus Streak can add
  bounded bonuses; priority never changes points, late tasks keep full base
  points, and points are never negative.
- The seeded walkthrough demonstrates the full loop: 41 existing points and a
  two-day streak become 93 points and a three-day streak after a 52-point Focus
  Task completion, unlocking Momentum Three and moving progress to 75%.
- A weekday without a selected Focus Task pauses the streak; selecting but not
  completing one breaks it; weekends neither increment nor break it.
- Motivation messages are deterministic, persisted, non-shaming templates in
  Calm, Friendly, Energetic, and Minimal tones. AI does not decide points,
  employee performance, messages, or notification timing.
- Completion uses an accessible, preference-aware Momentum-color confetti burst
  and emoji waves, plus reduced-motion and static fallbacks. The persisted
  receipt prevents endless replay after reload.
- Progress, personal achievements, in-app notifications, and supportive nudges
  provide visible momentum without a public leaderboard or punitive mechanics.

## Known limitations

- The seeded 52-point guided-demo identity/reset flow was deliberately not
  provisioned into Production; hosted reviewers should use open signup or
  GitHub OAuth and create their own workspace.
- Project restore, permanent deletion, and archived-project administration are
  deliberately deferred. Archive is currently a history-preserving, hide-only
  lifecycle action.
- Hult cohort seat discovery and assignment are implemented, but invitation
  delivery, member removal, and role-management UI are not.
- Resend/email delivery, SMS, phone collection, quiet hours, delivery workers,
  and a Production scheduler are deferred. The deadline scanner currently
  creates in-app notifications only and requires a trusted caller.
- There is no public leaderboard, social feed, billing, native mobile app,
  feedback administration dashboard, or complex analytics.
- The guided 2-to-3 streak demo is intentionally weekday-only because weekends
  must not change streak state.

## Agent usage summary

- Codex was used as a collaborative engineering agent for architecture,
  vertical-slice planning, implementation, Supabase migrations, domain and
  integration tests, Playwright flows, accessibility/responsive checks, release
  hardening, documentation, Git operations, deployment, and hosted smoke tests.
- The archive baseline fix used three non-overlapping subagents for database,
  server lifecycle, and UI/e2e work. The primary agent reviewed and integrated
  each result, ran the complete release gate, and reconciled migration history
  before applying the sole pending Production migration.
- The human product owner defined the motivation-first scope, chose the streak
  amendment and celebration direction, approved the archive design and
  contributor split, and manually exercised the application during development.
- Agent-generated changes were reviewed through scoped diffs, immutable domain
  boundaries, automated gates, a public application PR, and a real hosted smoke
  before this fix submission.
