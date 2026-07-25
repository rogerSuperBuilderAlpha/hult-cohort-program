# Project 2 Submission — @ramyatolety

**Beacon** — the cohort's internal comms platform, themed as a network of signal fires along a
mountain ridge. A public channel is a **beacon** you light and others tune into; a 1:1 is a
**whisper**; staff broadcasts go out on **the War Horn**, sounded only by a **Warden**. Distinct
visual language from Forth's parchment-and-guild theme (dark iron background, ember-orange
accents) so the two apps read as separate tools that share a cohort and an identity, not a reskin
of one another.

- Build repo: https://github.com/RamyaTolety/beacon-ramyatolety
- Submission doc: `submissions/ramyatolety-project-2.md`
- Production URL: https://beacon-ramyatolety.vercel.app

## Production URL

https://beacon-ramyatolety.vercel.app

No seeded reviewer credentials needed — sign in with your own Google or GitHub account (the same
providers Forth itself offers), or use **Continue as guest** on the login page (Firebase Anonymous
Auth) if OAuth is inconvenient for a quick review pass. Guests join the real workspace under a
temporary `Guest-XXXX` identity — it is not a sandboxed demo, messages are visible to everyone.
Every enrolled cohort member can join on first sign-in; there's no invite step.

## PM platform integration notes

Forth (this cohort's selected PM platform) doesn't expose a public API and its Firestore project
isn't reachable from here, so integration is implemented at the identity and workflow layer rather
than a literal shared backend:

- **Shared identity:** Beacon offers the same Google/GitHub sign-in providers as Forth, so a cohort
  member's `displayName`/`email` line up across both apps even though the two Firebase projects are
  independent.
- **Deep links:** any message containing a link to the cohort's Forth deployment renders as a
  distinct "Open in Forth" chip instead of a bare URL (`src/components/MessageText.tsx`).
- **Task notices:** a `/shipped` quick command — start any beacon message with `/shipped` and it
  renders as a flagged card (flame icon, distinct styling) instead of a normal bubble, a manual
  bridge for "this Forth ticket just moved to Shipped" until a real webhook exists. The natural
  next step is a Firestore-trigger webhook on Forth's side that auto-posts on ship — out of scope
  here since it requires a change to Forth itself, which is why a separate contribution is in
  flight there (see Agent usage below).

## Setup steps verified on fresh clone

1. `git clone https://github.com/RamyaTolety/beacon-ramyatolety.git && cd beacon-ramyatolety`
2. `npm install`
3. Create a Firebase project (Authentication: Google + GitHub providers; Firestore in production
   mode), deploy `firestore.rules` / `firestore.indexes.json`, copy the web config into `.env.local`
4. `npm run build` then `npm run dev` → http://localhost:3000
5. `npm run seed:channels` (Admin SDK) to create the four default beacons; `npm run promote:warden
   -- you@example.com` to grant the War Horn posting role

## Architecture summary

Next.js 16 (App Router) + TypeScript + Tailwind v4. Firebase Auth (Google + GitHub, redirect-based
sign-in) + Firestore with realtime `onSnapshot` listeners throughout — no polling. Firestore rules
give every signed-in cohort member read access to every beacon and post access to any
non-announcement beacon; only a Warden can post to the `isAnnouncement` beacon (the War Horn), and
`isAnnouncement` itself is immutable from the client so no user can grant themselves admin-only
posting rights. A user can update their own profile but never their own `role` — Warden promotion
is Admin-SDK-only (`npm run promote:warden`), mirroring Waypoint's immutable-`ownerEmail` pattern
from Project 1.

Data model:
- `users/{uid}` — `email`, `displayName`, `photoURL`, `role` (`member`|`warden`), `createdAt`,
  `lastActiveAt`
- `channels/{channelId}` — `name`, `topic`, `createdByUid`, `createdByEmail`, `createdAt`,
  `archived`, `isAnnouncement`, with a `messages` subcollection
- `dms/{dmId}` — deterministic id (sorted uid pair), `participantUids[2]`, `lastMessageAt`,
  `lastMessageText`, with a `dmMessages` subcollection (named differently from `messages`
  specifically so a channel-message collection-group search can never surface a private thread)

Persistence has no TTL/cleanup job, so the required ≥30-day history is satisfied by default.
Hosted on Vercel.

## Feature checklist against the brief

- **Channels:** 4 seeded beacons (`#general`, `#standup`, `#help`, `the-war-horn`); create, rename,
  archive/restore
- **Direct messages:** 1:1 whisper between any two cohort members, deterministic thread so either
  side opening it lands on the same conversation
- **Persistence:** Firestore, unlimited retention, survives refresh by construction
- **Announcements:** the War Horn — Warden-only posting, everyone reads, role un-self-assignable
- **Search:** keyword search across every beacon's messages (collection-group query on a
  `searchTokens` array); intentionally does not index whispers (see Known limitations)
- **Real-time:** Firestore `onSnapshot`, not polling — strictly better than the 5s-polling bar
- **Guest access:** Firebase Anonymous Auth sign-in for reviewers/newcomers who'd rather not use
  OAuth — a real account in the real workspace, not a separate sandboxed demo

## Known limitations

Stated plainly rather than left for a reviewer to find:

- **No cross-whisper search** — by design; whispers never enter any collection a search query can
  reach, so search is public-beacon-only.
- **No literal Forth API integration** — Forth doesn't expose one; deep links and `/shipped` are
  the pragmatic bridge, not a webhook. A real webhook is exactly the feature under discussion for
  the Forth contribution below.
- **No message editing or deletion** — not in the required feature set; a contained follow-up
  (extend the Firestore rules' `allow update`/`allow delete` plus a UI affordance), not a
  structural change.
- **No unread badges or push notifications** — real-time updates require the tab open; no service
  worker or email digest yet.
- **The account owner's own Google/GitHub sign-in hit an environment-specific failure** that
  wasn't reproducible from here after several rounds of fixes (popup→redirect switch, an
  authorized-domain misconfiguration). Both providers are confirmed correctly configured
  server-side (verified via Firebase's own public REST endpoints), and the redirect reaches a
  real provider picker in-browser, but a from-scratch OAuth login by the account owner is still
  unconfirmed. Anonymous guest sign-in — added as a fallback specifically because it needs no
  OAuth redirect — **is fully verified end-to-end** (see Test plan): two distinct guest identities
  messaging each other live in production, so the app itself is confirmed working regardless of
  the one open OAuth question.

## Agent usage summary

- **Research:** Read the cohort's own Week 2 brief directly off the program site (requirements,
  submission repo/branch/PR-title mechanics, deadline) rather than assuming; read Forth's README,
  `CONTRIBUTING.md`, and `docs/ticket-backlog.md`; spent hands-on time in Forth's own disposable
  demo (desktop and 375px mobile) to internalize its theme, terminology, and UX before designing a
  distinct-but-complementary theme for Beacon.
- **Development:** Built the full app via Claude Code — data model, Firestore rules, auth, beacons
  (channels) with create/rename/archive, whispers (DMs), the War Horn admin channel, keyword
  search, the `/shipped` Forth-integration bridge, and the dark iron/ember visual theme. Live-debugged
  a real production sign-in failure with the account owner across several rounds (popup→redirect
  auth switch, Firebase authorized-domain fix, cache-vs-deploy verification via direct inspection
  of the served JS bundle) rather than guessing at a fix.
- **QA:** `tsc --noEmit`, `eslint`, and `next build` all clean; visual verification in-browser at
  both desktop and 375px mobile widths; verified Firestore rules and OAuth provider config via
  Firebase's own public REST endpoints rather than assuming console clicks landed correctly;
  confirmed the production JS bundle actually contains each fix before declaring a deploy done.
  Then did a real live walkthrough as two distinct guest identities in production (not a local
  dev server), which surfaced three genuine bugs invisible to static checks — all found, root-
  caused, fixed, and re-verified live in the same pass:
  1. Search failed completely silently (a missing `.catch()` swallowed the error) — added error
     surfacing, which is what revealed the next two.
  2. Search then returned `permission-denied`: Firestore security rules scoped to a specific
     nested path (`channels/{id}/messages/{id}`) don't automatically extend to `collectionGroup()`
     queries — root-caused precisely (not just retried), confirmed via the exact Firebase error
     code, and fixed with an explicit `{path=**}` rule.
  3. Starting any new whisper failed the same way: the `dms/{id}` read rule dereferenced
     `resource.data` unconditionally, which errors — and Firestore rules treat a rule error as a
     denial — on the very first existence-check read of a not-yet-created thread. Confirmed via a
     direct authenticated REST call against Firestore (isolating the rule from any UI/browser
     variable), then fixed with a `resource == null` guard.
  Re-verified after each fix: search returns real results; two separately-authenticated guest
  identities created a whisper and exchanged a message that appeared instantly on both sides.

Separately, and not part of this submission: filed
[CodingWCal/forth#40](https://github.com/CodingWCal/forth/issues/40), a Ticket-claim issue for a
genuine, unclaimed accessibility bug found by reading Forth's source (the capacity progressbar's
`aria-valuenow` isn't clamped when a user goes over capacity, an invalid ARIA state). Per Forth's
own `CONTRIBUTING.md`, implementation is paused until a maintainer replies "scope confirmed" — as
of this update the issue is still open with no maintainer reply yet; the fix and PR will follow
once that lands.

## Test plan

- [x] Build repo public at `RamyaTolety/beacon-ramyatolety`
- [x] Production URL returns 200
- [x] `npm run build`, `eslint`, `tsc --noEmit` all clean
- [x] Firestore rules deployed and verified (permission-denied on anonymous read, not
      database-not-found — confirms both rules and the database itself are live)
- [x] Google and GitHub sign-in providers verified configured via Firebase's public
      `accounts:createAuthUri` REST endpoint (not just "I clicked enable")
- [x] Google sign-in redirect verified live in-browser on production — lands on a real
      `accounts.google.com` picker for the correct Firebase project
- [x] 4 default beacons seeded (`#general`, `#standup`, `#help`, `the-war-horn`) via
      `npm run seed:channels`
- [x] Visual QA on production at desktop and 375px mobile widths, both the pre- and
      post-authentication shell
- [x] Guest sign-in (Firebase Anonymous Auth) added, deployed, and enabled — verified live
- [x] Full logged-in walkthrough, done live in production as two distinct guest identities:
      send + persist a channel message; create, rename, and archive a beacon; War Horn correctly
      blocks a non-Warden poster and shows the disabled reason; keyword search returns real
      results; start a whisper between two separate users and exchange a message that appears
      instantly on both sides
- [x] Two real bugs in Firestore security rules found via that live walkthrough (not caught by
      any static check), root-caused via direct REST calls, fixed, and re-verified — see Agent
      usage
- [ ] The account owner's own Google/GitHub OAuth sign-in specifically — still unconfirmed (see
      Known limitations); everything else about the app is independently verified working
