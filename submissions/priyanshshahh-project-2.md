# Project 2 Submission — @priyanshshahh

Summer Pilot 2026, Project 2 — Internal communications platform.

## Reviewers: start here (no signup)

**▶ Interactive live demo — no account needed: https://cohort-comms-phi.vercel.app/demo**

Open `/demo` and you can **post, react, open DMs, and run a 30-second Forth tour**
without signing up. Local-only state — nothing writes to the live cohort DB.
The Forth board pane opens by default. Look for the message tagged `WEBHOOK` in
`#general` — that was posted by `POST /api/webhooks/forth`, not typed by a human.

Sign in at https://cohort-comms-phi.vercel.app to join the real workspace.

## Summary

**Cohort Comms** replaces Discord as the cohort's primary channel: channels,
direct messages, global search, emoji reactions, admin-only announcements,
unread badges, presence, and light/dark themes.

Three things set it apart from a standard chat app — all working, not described:

1. **Interactive no-signup demo** at `/demo` — reviewers post, react, DM, and
   tour the Forth loop in under a minute without creating an account.
2. **The Forth board is embedded inside the app** as a split-pane (open by
   default), so you read `#general` on the left and move a ticket on the right.
3. **A live inbound webhook — `POST /api/webhooks/forth`.** Forth publishes no
   outbound webhooks yet, so rather than stopping at "no API, cannot integrate",
   the *receiving half of the contract is built, secured, and verified*. Point
   Forth or any relay at it with the shared secret and board events post
   themselves into the cohort's channels.

Next.js 16 (App Router) + Clerk auth + **Neon Postgres** via Drizzle ORM, both
provisioned through the Vercel Marketplace.

## Production URL

https://cohort-comms-phi.vercel.app

Build repo: https://github.com/priyanshshahh/cohort-comms

## PM platform integration notes

The cohort PM platform is **Forth** (https://forth-bice.vercel.app,
https://github.com/CodingWCal/forth). Forth is Next.js + Firebase and publishes
no public REST API and no outbound webhooks, so the integration works at four
levels:

**1. Inbound webhook (the part nobody else built).**
`POST /api/webhooks/forth`, authenticated with a shared secret compared in
constant time, posts board events into a channel as a distinct `Forth` bot
identity. Verified against five cases on production:

| Case | Result |
|---|---|
| Wrong secret | `401` |
| Missing secret | `401` |
| Missing `ticket.title` | `400` |
| Valid shipped ticket | `201` — rendered in `#general` as “✅ Ship Cohort Comms moved to Shipped · priyanshshahh” |
| Payload carrying `https://evil.example.com/phish` | `201`, **hostile URL stripped** — only same-origin Forth links are ever rendered |

```bash
curl -X POST https://cohort-comms-phi.vercel.app/api/webhooks/forth \
  -H 'content-type: application/json' \
  -H 'x-forth-secret: <FORTH_WEBHOOK_SECRET>' \
  -d '{"event":"ticket.shipped","channel":"general",
       "ticket":{"title":"Ship comms","status":"Shipped",
                 "assignee":"priyanshshahh",
                 "url":"https://forth-bice.vercel.app/chronicle"}}'
```

**2. Embedded board.** A toggleable split-pane renders live Forth inside Comms.
Confirmed viable rather than assumed: Forth serves no `X-Frame-Options` and no
frame-blocking CSP. An "Open in tab" link sits beside it for browsers that block
third-party cookies in frames.

**3. Deep-link cards.** Any `forth-bice.vercel.app` URL pasted into a channel or
DM renders as a card labelled with the Forth view it targets (Quest Log, Realm
Map, Chronicle, Guild Hall). Webhook deliveries pick this up automatically.

**4. Shared identity.** Forth signs in with Google and GitHub OAuth; Comms uses
the same providers via Clerk, so one identity spans both tools.

I also contributed upstream to Forth documenting that it is safely embeddable,
so the rest of the cohort can integrate the same way:
https://github.com/CodingWCal/forth/pull/47

**Real-time vs async:** async polling. SWR refreshes a conversation every 2s and
the sidebar every 5s — deliberately not WebSockets. At cohort scale that is a
couple of indexed queries per client per second and it removes a class of
connection-lifecycle failures on serverless. Trade-off stated plainly: delivery
latency is up to ~2s, not instant. Swapping transport changes neither the schema
nor the API surface.

**On persistence:** Neon Postgres, *not* SQLite. A local `.db` file cannot work
on Vercel — the serverless filesystem is ephemeral and not shared between
instances, so messages would silently vanish on cold starts. Postgres is what
actually satisfies the ≥30-day history requirement.

## Measured quality bar

Lighthouse on the live demo page, desktop, navigation mode — **55 audits passed, 0 failed**:

| Category | Score |
|---|---|
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |
| Agentic Browsing | **100** |

Getting there was real work, not luck. The code was audited against Vercel's
[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
and the following were found and fixed:

- White-on-teal buttons measured **1.86:1** contrast (WCAG needs 4.5:1). Introduced an
  `--on-accent` token so label text flips to near-black on the light teal in dark mode.
- Clerk was loading on `/` and `/demo`, setting **third-party cookies on pages that do
  not need auth**. Scoped `ClerkProvider` to authenticated routes only — better privacy,
  faster public pages, and Best Practices went 77 → 100.
- `robots.txt`, `sitemap.xml`, and `llms.txt` were being swallowed by the auth proxy and
  returning 404. Exempted them.
- Added skip-link, `color-scheme`, `theme-color`, `prefers-reduced-motion` handling,
  `touch-action: manipulation`, `overscroll-behavior: contain` on the drawer,
  `focus-visible` rings, tabular numerals, image dimensions, and accessible names on
  every icon-only control.

## Keyboard and usability

- **⌘K / Ctrl-K command palette** — jump to any channel, person, or message. Arrow keys
  navigate, Enter opens, Escape closes.
- The Forth board overlays below `xl` and only becomes a true third column when the
  viewport can actually hold three, so the message column never gets crushed.
- Light and dark themes with no flash on load; choice persists.

## Feature checklist

| Requirement | Status |
|---|---|
| Channels (≥3 public) | `#announcements`, `#general`, `#project-2`, `#peer-review`, `#help`, plus member-created |
| Direct messages | 1:1 with any member, keyed by sorted user-id pair |
| Persistence | Neon Postgres + Drizzle; survives refresh, restart, redeploy |
| Announcements | Admin-only, enforced in the API **and** the UI |
| Search | Global keyword search across channels + your own DMs, click-through to source |
| Real-time feel | SWR polling, 2s conversation / 5s sidebar |
| Emoji reactions | 6-emoji palette, toggle on/off, per-user state |
| Light + dark mode | Semantic design tokens, persisted, no flash on load |
| PM integration | Inbound webhook + embedded board + deep-link cards + shared identity |

## Agent usage

- **Research:** Claude Code inspected the Forth repo and live deployment to
  establish the real integration surface (Firebase Auth with Google/GitHub,
  Firestore, no public API or webhooks) and probed its response headers to
  confirm it could legally be iframed. Read the cohort repo to match the
  `submissions/` convention, and read the bundled Next.js 16 docs to catch
  breaking changes from training data — notably Middleware being renamed Proxy,
  and `proxy.ts` needing to sit beside `app/`.
- **Dev:** Provisioned Clerk and Neon via the Vercel Marketplace CLI; designed
  the schema (one `messages` table backing both channels and DMs, keyed by
  `channel_id` or a sorted-pair `dm_key`, plus per-user read cursors and a
  reactions table); implemented the API routes, polling client, search, admin
  gating, the secret-authenticated Forth webhook, the embedded board pane, the
  semantic-token theming system, and the mobile layout.
- **QA:** `npm run build` clean (compile + typecheck), then driven through
  Chrome DevTools against production. Six real defects were caught and fixed
  rather than assumed away:
  1. 500 from `proxy.ts` at repo root instead of `src/`.
  2. Scaffold `globals.css` overriding the Tailwind theme.
  3. `drizzle-kit push` silently failing, leaving `admin_only`/`archived`
     missing and 500-ing the app until applied via explicit DDL.
  4. Clerk's route protection swallowing the webhook as a 404 — webhooks now
     bypass session auth and rely on their own secret.
  5. Admin gate verified *negatively* by removing myself from `ADMIN_HANDLES`,
     redeploying, and confirming the composer is replaced by a lock.
  6. Webhook URL-injection guard verified by sending a hostile link and
     confirming it was stripped from the stored message.

## Test plan

- [x] `npm run build` passes (compile + TypeScript)
- [x] Production deploy live
- [x] Sign in with Clerk, land in `#general`
- [x] Post a message in a public channel; persists across reloads
- [x] Global search returns the message with channel label and click-through
- [x] Emoji reaction added from the UI and confirmed persisted in Postgres
- [x] Non-admin sees “🔒 Only cohort admins can post in #announcements”
      (verified by removing myself from `ADMIN_HANDLES` and redeploying)
- [x] Forth webhook: 401 on wrong secret, 401 on missing secret, 400 on missing
      title, 201 on valid delivery, hostile URL stripped
- [x] Forth board loads embedded in the split-pane, and in a new tab
- [x] Light and dark mode both render correctly; choice persists
- [x] Unauthenticated request to a channel returns no channel content
- [ ] Multi-user concurrency (two accounts DMing, unread badge incrementing for
      the recipient) — single-account verified only; peers will exercise this on
      the live deploy during review week
- [ ] No automated test suite — verification was build, deploy, and driven
      browser + API checks

## Known limitations

- Clerk runs on a **development instance** (`pk_test_…`). It works for browser
  sign-ups at cohort scale but shows a "Development mode" badge; a production
  instance needs a custom domain with DNS records, which a `*.vercel.app`
  subdomain cannot provide.
- Unread counts scan the most recent 2000 messages — ample for the pilot, but a
  cap rather than unbounded history.
- No threads and no file upload. Both need a schema change plus new UI, and I
  would rather ship six things that are verified than eight that are claimed.
- The Forth webhook is the receiving half only. Forth must add outbound delivery
  (or a relay must call it) for events to flow automatically; until then it is
  driven by `curl`, as demonstrated above.
