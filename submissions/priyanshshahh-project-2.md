# Project 2 Submission — @priyanshshahh

Summer Pilot 2026, Project 2 — Internal communications platform.

## Summary

**Cohort Comms** replaces Discord as the cohort's primary channel: public
channels, direct messages, unread notification badges, presence, and
Forth-aware messages that render pasted board links as cards.

Built on Next.js 16 (App Router), Clerk for authentication, and Neon Postgres
via Drizzle ORM, both provisioned through the Vercel Marketplace.

## Production URL

https://cohort-comms-phi.vercel.app

Build repo: https://github.com/priyanshshahh/cohort-comms

## PM platform integration notes

The cohort PM platform is **Forth** (https://forth-bice.vercel.app,
https://github.com/CodingWCal/forth).

Forth is a Next.js + Firebase app that publishes **no public REST API and no
webhooks**, so the integration is link-level and identity-level rather than
server-to-server. What actually ships:

- **Deep links** — any `forth-bice.vercel.app` URL pasted into a channel or DM
  is detected and rendered as a card labelled with the Forth view it points at
  (Quest Log, Realm Map, Chronicle, Guild Hall), so a conversation about a
  ticket carries a one-click route back to the board.
- **Persistent entry point** — a Forth board link sits in the sidebar on every
  screen of the app.
- **Shared identity** — Forth signs in with Google and GitHub OAuth; Comms uses
  the same providers through Clerk, so a member carries one identity across
  both tools rather than maintaining separate accounts.

**Not shipped, and why:** automatic task notifications (a Forth ticket moving to
Shipped posting into `#general`) require an API or webhook Forth does not
currently expose. The receiving end here is a single `postMessage()` call, so
this becomes a small change if Forth publishes one.

**Real-time vs async:** async. Messages are delivered by short-interval HTTP
polling via SWR — 2s inside a conversation, 5s for the sidebar — not WebSockets.
At cohort scale this is a couple of lightweight queries per client per second
and removes a class of connection-lifecycle bugs on serverless. The trade-off is
stated plainly: delivery latency is up to ~2 seconds rather than instant.
Swapping the transport to sockets or SSE later changes neither the schema nor
the API surface.

## Agent usage

- **Research:** Claude Code inspected the Forth repo and deployment to establish
  what integration surface actually exists (found: Firebase Auth with Google and
  GitHub OAuth, Firestore persistence, no public API or webhooks), read the
  cohort repo to match the existing `submissions/` convention, and read the
  bundled Next.js 16 docs to catch breaking changes from training data — notably
  that Middleware is renamed Proxy and that `proxy.ts` must sit beside `app/`.
- **Dev:** Claude Code provisioned Clerk and Neon through the Vercel Marketplace
  CLI, designed the schema (a single `messages` table backing both channels and
  DMs, keyed by `channel_id` or a sorted-pair `dm_key`, plus per-user read
  cursors for unread counts), and implemented the API routes, the polling chat
  client, the sidebar with unread badges and presence, the Forth link parser and
  cards, channel creation, the landing page, and mobile responsiveness.
- **QA:** `npm run build` passes clean (typecheck included). Deployed to Vercel
  production. Verified in-browser: landing page, dark theme, Clerk sign-in, and
  that unauthenticated access to `/c/general` does not leak content. Two runtime
  defects were caught and fixed this way rather than assumed working — a 500
  from `proxy.ts` sitting at the repo root instead of `src/`, and the scaffold's
  `globals.css` `body` rule overriding the Tailwind dark theme.

## Test plan

- [x] `npm run build` passes (compile + TypeScript)
- [x] Production deploy live at https://cohort-comms-phi.vercel.app
- [x] Landing page renders; dark theme applied
- [x] Clerk sign-in page renders on production
- [x] Unauthenticated request to `/c/general` does not return channel content
- [ ] Signed-in end-to-end pass (send in channel, DM, unread badge clears,
      Forth card renders) — exercised by peers on the live deploy during review
      week; not verified by the agent, which does not create accounts
- [ ] No automated test suite in this submission — verification was build,
      deploy, and manual browser checks
