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
providers Forth itself offers). Every enrolled cohort member can join on first sign-in; there's no
invite step.

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
- **A full authenticated end-to-end walkthrough (send a message, DM, search, Warden post) has not
  yet been independently re-verified by me post-deploy** — auth was debugged live against
  production during this build (redirect-flow switch, Firebase authorized-domain fix), and I
  confirmed the sign-in redirect itself reaches a real Google account picker for
  `communication-app-cohort.firebaseapp.com`, but completing an actual login requires the account
  owner's credentials, which I don't have and won't attempt to obtain. I'll update this line once
  a full logged-in pass is confirmed.

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
  both desktop and 375px mobile widths on the deployed production URL; verified Firestore rules
  actually behave as intended and that the Google/GitHub OAuth providers are genuinely configured,
  using Firebase's own public REST endpoints (`accounts:createAuthUri`) rather than assuming
  console clicks landed correctly; confirmed the production JS bundle actually contains each fix
  before declaring a deploy done, after a stale-cache report from the account owner turned out to
  be a real (if confusing) client-side caching issue rather than a bad deploy.

Separately, and not part of this submission: filed
[CodingWCal/forth#40](https://github.com/CodingWCal/forth/issues/40), a Ticket-claim issue for a
genuine, unclaimed accessibility bug found by reading Forth's source (the capacity progressbar's
`aria-valuenow` isn't clamped when a user goes over capacity, an invalid ARIA state). Per Forth's
own `CONTRIBUTING.md`, implementation is paused until a maintainer replies "scope confirmed" — the
fix and PR will follow once that lands.

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
- [ ] Full logged-in walkthrough (send message, create/rename/archive a beacon, DM another
      member, keyword search, Warden-only War Horn post) — pending final confirmation from the
      account owner post-sign-in; see Known limitations
