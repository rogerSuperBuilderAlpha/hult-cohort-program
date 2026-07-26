# Project 2 Submission — @priyanshshahh

Summer Pilot 2026, Project 2 — Internal communications platform.

## Summary

**Cohort Comms** replaces Discord as the cohort's primary channel: public
channels, direct messages, global search, admin-only announcements, unread
notification badges, presence, and light/dark themes — with the **Forth board
embedded directly in the app** so nobody leaves the conversation to update a
ticket.

Next.js 16 (App Router) + Clerk auth + **Neon Postgres** via Drizzle ORM, both
provisioned through the Vercel Marketplace.

## Production URL

https://cohort-comms-phi.vercel.app

Build repo: https://github.com/priyanshshahh/cohort-comms

## PM platform integration notes

The cohort PM platform is **Forth** (https://forth-bice.vercel.app,
https://github.com/CodingWCal/forth).

Forth is a Next.js + Firebase app that publishes **no public REST API and no
webhooks**, so the integration is embed-, link-, and identity-level rather than
server-to-server:

- **Embedded command centre** — a toggleable split-pane renders the live Forth
  board *inside* Comms. You can read `#general` on the left and move a ticket on
  the right without switching tabs. Verified working: Forth serves no
  `X-Frame-Options` or frame-blocking CSP, so the embed loads for real.
- **Deep-link cards** — any `forth-bice.vercel.app` URL pasted into a channel or
  DM is detected and rendered as a card labelled with the Forth view it points
  at (Quest Log, Realm Map, Chronicle, Guild Hall).
- **Shared identity** — Forth signs in with Google and GitHub OAuth; Comms uses
  the same providers via Clerk, so one identity spans both tools.

**Not shipped, and why:** automatic task notifications (a ticket moving to
Shipped posting into `#general`) need an API or webhook Forth does not expose.
The receiving end here is one `postMessage()` call, so it is a small change if
Forth publishes one.

**Real-time vs async:** async polling. SWR refreshes a conversation every 2s and
the sidebar every 5s — deliberately not WebSockets. At cohort scale this is a
couple of indexed queries per client per second and removes a class of
connection-lifecycle failures on serverless. Trade-off stated plainly: delivery
latency is up to ~2s, not instant. Swapping transport later changes neither the
schema nor the API surface.

**On persistence:** this uses Neon Postgres, *not* SQLite. A local `.db` file
cannot work on Vercel — the serverless filesystem is ephemeral and not shared
between instances, so messages would silently disappear on cold starts. Postgres
is what actually satisfies the ≥30-day history requirement.

## Feature checklist

| Requirement | Status |
|---|---|
| Channels (≥3 public) | `#announcements`, `#general`, `#project-2`, `#peer-review`, `#help`, plus member-created |
| Direct messages | 1:1 with any enrolled member, keyed by sorted user-id pair |
| Persistence | Neon Postgres + Drizzle; survives refresh, restart, and redeploy |
| Announcements | `#announcements` is admin-only; enforced in the API *and* the UI |
| Search | Global keyword search across channels + your own DMs, click-through to source |
| Real-time feel | SWR polling, 2s conversation / 5s sidebar |
| Light + dark mode | Semantic design tokens, toggle persisted, no flash on load |

## Agent usage

- **Research:** Claude Code inspected the Forth repo and live deployment to
  establish the real integration surface (Firebase Auth with Google/GitHub,
  Firestore, no public API or webhooks) and probed its response headers to
  confirm it could legally be iframed. Read the cohort repo to match the
  existing `submissions/` convention, and read the bundled Next.js 16 docs to
  catch breaking changes from training data — notably Middleware being renamed
  Proxy, and `proxy.ts` needing to sit beside `app/`.
- **Dev:** Provisioned Clerk and Neon via the Vercel Marketplace CLI; designed
  the schema (one `messages` table backing both channels and DMs, keyed by
  `channel_id` or a sorted-pair `dm_key`, plus per-user read cursors for unread
  counts); implemented the API routes, polling chat client, search, admin
  gating, the embedded Forth pane, the semantic-token theming system, channel
  creation, landing page, and mobile layout.
- **QA:** `npm run build` clean (compile + typecheck). Deployed to Vercel and
  driven through Chrome DevTools. Four real defects were caught and fixed rather
  than assumed away: a 500 from `proxy.ts` at repo root instead of `src/`; the
  scaffold's `globals.css` overriding the Tailwind theme; a `drizzle-kit push`
  that silently failed, leaving `admin_only`/`archived` columns missing and
  500-ing the app until applied via explicit DDL; and the admin gate, which was
  verified by temporarily removing myself from the admin list and confirming the
  composer really is replaced by a lock.

## Test plan

- [x] `npm run build` passes (compile + TypeScript)
- [x] Production deploy live at https://cohort-comms-phi.vercel.app
- [x] Sign in with Clerk, land in `#general`
- [x] Post a message in a public channel; it persists across reloads
- [x] Global search returns the message with channel label and click-through
- [x] Non-admin sees "🔒 Only cohort admins can post in #announcements"
      (verified by removing myself from `ADMIN_HANDLES` and redeploying)
- [x] Forth board loads embedded in the split-pane, and in a new tab
- [x] Light and dark mode both render correctly; choice persists
- [x] Unauthenticated request to a channel returns no channel content
- [ ] Multi-user concurrency (two accounts DMing, unread badge incrementing for
      the recipient) — single-account verified only; peers will exercise this on
      the live deploy during review week
- [ ] No automated test suite — verification was build, deploy, and driven
      browser checks

## Known limitations

- Clerk is running on a **development instance** (`pk_test_…`). It works for
  browser sign-ups at cohort scale but shows a "Development mode" badge; a
  production instance requires a custom domain with DNS records, which a
  `*.vercel.app` subdomain cannot provide.
- Unread counts scan the most recent 2000 messages, which is ample for the pilot
  but is a cap, not unbounded history.
