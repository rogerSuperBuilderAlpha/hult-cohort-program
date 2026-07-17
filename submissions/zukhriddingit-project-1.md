# Project 1 Submission — @zukhriddingit

Momentum is a motivation-first project-management platform for small teams. Its
core loop is: create a task, choose today's Focus Task, complete it, earn
transparent points exactly once, extend a streak, receive supportive feedback,
and see project progress update.

## Production URL

**https://momentum-bay-two.vercel.app**

- Build repository: https://github.com/zukhriddingit/Momentum
- Current review branch: https://github.com/zukhriddingit/Momentum/tree/codex/slice-4-demo-pilot-readiness
- Build pull request: https://github.com/zukhriddingit/Momentum/pull/3

The Vercel production deployment uses a separate hosted Supabase project. On
July 17, 2026, its health endpoint returned HTTP 200 and a fresh-user browser
smoke test verified immediate password signup, workspace and project creation,
and persisted authentication/data after reload.

## Setup steps verified on a fresh clone

Verified on July 17, 2026 from a new clone of commit `29b4491` on the review
branch. The deployed release is `5b30568`; the intervening commit only adds
Vercel's local project metadata directory to `.gitignore`.

Requirements: Node.js 20.9 or newer, pnpm 11, Docker Desktop, and Chromium for
Playwright.

```bash
git clone --branch codex/slice-4-demo-pilot-readiness --single-branch \
  https://github.com/zukhriddingit/Momentum.git
cd Momentum
pnpm install --frozen-lockfile
pnpm supabase:start
CI=true pnpm validate
```

The clean-clone release gate passed:

- formatting, ESLint, and strict TypeScript checks;
- 126 unit tests across 22 files;
- 72 pgTAP database assertions across four files;
- 35 database-backed integration tests across eight files;
- three primary Playwright flows;
- deterministic demo provisioning verified twice;
- one guided-demo Playwright flow;
- tracked-source secret scan; and
- optimized Next.js production build.

For local use, run `pnpm dev:local`, open `http://localhost:3000`, and follow the
demo credentials and walkthrough documented in the repository README. The test
commands reset the local database and must not target a shared or production
database.

## Architecture summary

- **Application:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind
  CSS, and accessible shadcn/ui-compatible Radix primitives.
- **Authentication and data:** Supabase Auth plus PostgreSQL migrations, RLS,
  constraints, triggers, and transaction-backed server services.
- **Authorization:** Authenticated server actions and services authorize
  workspace membership, ownership, assignments, and task transitions; trusted
  rewards are never calculated in the browser.
- **Domain layer:** Pure TypeScript functions own rewards, streak transitions,
  achievements, deadline classification, and deterministic motivational-message
  selection outside React components.
- **Completion transaction:** The first completion atomically updates the task,
  writes an immutable point-ledger entry, updates the Focus Streak, unlocks
  achievements, snapshots the supportive message, creates an in-app
  notification, and returns a persisted celebration receipt. Database identities
  make retries and reopen/recomplete flows idempotent.
- **Operations:** Environment separation, health checks, safe request IDs and
  structured logs, guarded demo provision/reset scripts, source-secret scanning,
  a deployment runbook, and a closed-pilot checklist.
- **Testing:** Vitest for domain and server behavior, pgTAP for database
  invariants, database-backed integration tests, and Playwright for user flows
  and the clean guided demo.

## Motivation / engagement design notes

- Each person chooses at most one assigned Focus Task per workday, keeping the
  dashboard centered on today's work instead of enterprise administration.
- Effort determines transparent base points: Small 20, Medium 40, Large 70, and
  Extra Large 100. Finishing early and maintaining a Focus Streak can add
  bounded bonuses; priority never changes points, late tasks keep full base
  points, and points are never negative.
- The seeded walkthrough demonstrates the full loop: 41 existing points and a
  two-day streak become 93 points and a three-day streak after a 52-point Focus
  Task completion, unlocking Momentum Three and moving project progress to 75%.
- A weekday without a selected Focus Task pauses the streak; selecting but not
  completing one breaks it; weekends neither increment nor break it.
- Motivation messages are deterministic, persisted, non-shaming templates in
  Calm, Friendly, Energetic, and Minimal tones. AI does not decide points,
  employee performance, messages, or notification timing.
- Completion uses an accessible, preference-aware celebration with a loud
  Momentum-color confetti burst and emoji waves, plus reduced-motion and static
  fallbacks. The persisted receipt prevents the animation from replaying
  endlessly after reload.
- Progress, streaks, personal achievements, in-app notifications, and supportive
  deadline nudges provide visible momentum without a public leaderboard or
  punitive mechanics.

## Known limitations

- The hosted smoke test covers fresh-user signup and self-service onboarding;
  the seeded 52-point guided-demo identity/reset flow was deliberately not
  provisioned into the Production database.
- Resend/email delivery, SMS, phone collection, quiet hours, delivery workers,
  and a production scheduler are deferred. The current deadline scanner creates
  in-app notifications only and requires a trusted caller.
- Workspace invitations and member administration are not implemented; the
  current self-service flow creates an owner workspace and project.
- There is no public leaderboard, social feed, billing, native mobile app,
  feedback administration dashboard, or complex analytics.
- The guided 2-to-3 streak demo is intentionally weekday-only because weekends
  must not change streak state.

## Agent usage summary

- Codex was used as a collaborative engineering agent for architecture and
  vertical-slice planning, implementation, Supabase migrations, domain and
  integration tests, Playwright flows, accessibility and responsive UI checks,
  release hardening, documentation, Git operations, and clean-clone validation.
- The human product owner defined the motivation-first scope, chose the streak
  amendment and celebration direction, reviewed alternatives, approved each
  design stage, and manually exercised the application during development.
- Agent-generated changes were reviewed through scoped diffs and automated
  gates. A final clean-clone run exposed a request-context defect in the
  deadline job; it was diagnosed, fixed in commit `29b4491`, and the complete
  release gate was rerun successfully before this submission.
