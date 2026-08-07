# Project 1 Submission — @CodingWCal

**Production URL:** https://forth-bice.vercel.app
**Repo:** https://github.com/CodingWCal/forth

## Architecture summary

Forth is a TypeScript / React 19 / Next.js 16 (App Router) project-management app. Firebase Auth (Google OAuth) and Firestore back a private, per-guild ("workspace") cloud sync layer, with localStorage as a same-device fallback when signed out. Domain state (projects, tasks, status transitions, capacity/WIP rules) lives in a single reducer (`lib/workspace.ts`) so business rules stay independent of the UI and are unit-tested directly. Firestore security rules enforce owner/member/recipient boundaries per workspace and are verified with the Firebase emulator (`pnpm test:rules`), not just client-side checks.

Guild (workspace) membership works today through an invitation flow: an owner invites a teammate by Google email, the invite is stored Firestore-side scoped to that exact email, and the invited account sees it automatically in an in-app "pending invitations" panel on sign-in — accept/decline, with server-enforced expiry and idempotent accept/cancel.

## Motivation / engagement design notes

The product goal is intrinsic motivation, not gamified pressure: a daily "pace" choice sets an honest work capacity, a hard 3-task WIP limit on "Today," and a "Proof" ledger of shipped work replace streaks, leaderboards, and point systems. Status labels (Ready/Moving/Paused/Landed) are literal, not decorative, so the fantasy skin (SNES-era "Iron & Parchment" framing — quests, guilds, chronicles) never obscures the underlying PM semantics. No punishment states, broken-streak shaming, or public rankings exist by design.

## Known limitations

Being upfront about gaps against the full PM-platform bar rather than glossing over them:

- **Assignment is not yet directory-backed for every cohort member.** A task assignee is currently a typed display name, not a verified member picked from an authenticated roster across the whole workspace membership. Guild membership itself *is* real (Google-auth invitations, above); assignee-by-verified-member is the next increment.
- **No open self-service signup across all cohort accounts.** Joining a guild requires an owner-sent, email-scoped invitation (by design, for private-beta data isolation) rather than open registration against a cohort email domain.
- **Not load-tested at 10 concurrent simultaneous users or verified at ≥30 distinct accounts** — architecture supports many accounts/workspaces, but this hasn't been exercised at that scale yet.
- **Concurrent-edit data loss is a known open risk.** Cloud saves are last-write-wins over a single state document; two clients editing at once can silently overwrite each other. Tracked as an open, prioritized backlog item (not yet fixed).
- **No comments on tasks, due-date reminders, or a metrics dashboard.** Task list filtering by project/status/focus exists; assignee-based filtering and notifications do not yet.
- **Auth is Google OAuth only** (no email+password path).

Full, evidence-backed backlog with priority/effort/acceptance-criteria for every open item lives in [`docs/ticket-backlog.md`](https://github.com/CodingWCal/forth/blob/main/docs/ticket-backlog.md) in the Forth repo.

## Setup steps verified on a fresh clone

```
pnpm install
pnpm dev        # local, localStorage-only mode works with zero config
pnpm lint
pnpm typecheck
pnpm test          # Vitest unit/domain tests
pnpm test:rules    # Firestore emulator security-rule tests
pnpm build         # production build
```

Cloud mode additionally requires Firebase project config in `.env.local` (see `.env.example`) and `firebase deploy --only firestore:rules,firestore:indexes` for the invitation/collection-group queries to be live in that project.

## Agent usage summary

Built iteratively with Claude Code (Anthropic) across multiple sessions. The agent implemented the guild invitation feature end-to-end (creation, recipient-scoped Firestore rules, in-app accept/decline panel, then cancel/expiry lifecycle), diagnosed and fixed a first-run Firestore provisioning bug by reproducing it in the rules emulator before patching the rule and client, and ran the full validation gate (lint, typecheck, unit tests, emulator rules tests, production build) before every push. All Firestore rule changes were proven with emulator tests asserting both the intended access *and* that unrelated accounts are denied, rather than relying on manual/UI-only verification.
