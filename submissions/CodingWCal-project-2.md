# Project 2 Submission — @CodingWCal

**Calvin V.** · Hult Cohort Developer Program · Summer 2026 · Project 2 (Cohort communications platform)

**Production URL:** https://commons-9pxt.onrender.com
**Repo:** https://github.com/CodingWCal/commons

## Summary

**Commons** is a focused, real-time team chat built for the cohort: channels, private 1:1 DMs, emoji reactions, message editing/deletion with moderation roles, keyword search, typing indicators, presence, and image/file attachments (Cloudinary) — all backed by a real Postgres database (Neon) and deployed on Render.

## Production URL

https://commons-9pxt.onrender.com

The first request after a quiet period may take ~30–60s to wake up (Render free tier cold start).

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/CodingWCal/commons.git
cd commons
npm install                 # installs deps + generates the Prisma client
cp .env.example .env        # then paste a Postgres URL + a session secret
npm run db:push             # sync the schema to your database
npm run db:seed             # seed #general, #week-2, #help, #showcase
npm run dev                 # http://localhost:3000
```

This is genuinely exercised, not just claimed: `npm ci && npm run build && npm test && npm run test:e2e` runs on every push via GitHub Actions CI (badge in the README), and the schema/seed/dev cycle above was run repeatedly while building this, against a real hosted Postgres instance rather than a local file.

## Architecture summary

- **Framework:** Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4.
- **Data:** Prisma ORM on Postgres (Neon), synced with `prisma db push`. Models: `User`, `Session`, `Channel`, `Membership`, `Message`, `Reaction`, `Presence`, `RateLimitHit`.
- **Auth:** Credential (bcrypt-hashed passwords), opaque session tokens HMAC-hashed in the DB, delivered as an `httpOnly`/`SameSite=Lax` cookie.
- **Realtime:** `GET /api/stream` opens a Server-Sent Events connection per client. A message POST persists to Postgres, then publishes to an in-process event bus which fans out to this instance's own SSE clients immediately **and** relays a slim, re-hydratable payload to every other server instance via Postgres `LISTEN`/`NOTIFY` — so it stays correct across multiple deployed instances, not just one process. Presence and rate limiting are similarly backed by durable Postgres tables (not in-memory), for the same reason.
- **Verification, not just design:** I actually ran two separate `next start` processes against the same database and confirmed a message sent via instance A arrived live via SSE on instance B, and that presence agreed across both — including catching and fixing a real bug where a DM relayed to a second instance would have broadcast to everyone connected there instead of just the two participants.

```
Browser --HTTP--> Next.js Route Handlers --> Prisma --> Postgres
   ^                      |                      ^
   +-- SSE stream <-- local emitter --> LISTEN/NOTIFY (cross-instance relay)
```

## Motivation / engagement design notes

The design goal was a chat that feels **calm and purposeful**, not another noisy, over-featured tool competing with Slack/Discord for the cohort's attention:

- **Editorial visual identity** (a warm paper/ink palette, a display serif for the wordmark/headings) so it reads as crafted, not a default framework template — first impressions matter for whether a cohort actually adopts a new tool.
- **Presence + typing indicators** give the ambient "who's here" signal that drives return visits, without notification overload.
- **Channels + DMs** give people both a shared cohort space and a private one, covering the two most common real communication needs.
- **Reactions** are a low-friction way to acknowledge something without adding to channel noise with another full reply.
- **Optional invite-code gating** (`COMMONS_INVITE_CODE`) keeps the space trusted and cohort-scoped rather than open to anyone with the URL, and the **first person to sign up automatically becomes admin** — the space self-bootstraps a facilitator without any manual setup step.

## Known limitations

- Single attachment per message (images/PDF/plain text, 8 MB cap) — no multi-file attachments yet.
- No message threading (replies are flat, chronological).
- Render's free tier cold-starts after ~15 minutes idle (~30–60s to wake).
- E2E tests currently run against the same Postgres database as local dev (tagged `@example.com` accounts / `E2E `-prefixed test channels, swept up automatically after each run) rather than a fully isolated test database/branch.
- No hosted error tracking (e.g. Sentry) yet — currently structured JSON audit logging only.
- A cosmetic Prisma CLI deprecation warning (`package.json#prisma` config key) is intentionally left as-is rather than risk breaking env loading for a warning with no functional impact.

All of the above are tracked with the same rigor as the shipped work in [`BACKLOG.md`](https://github.com/CodingWCal/commons/blob/main/BACKLOG.md) in the repo, rather than left implicit.

## Agent usage summary

This was built end-to-end in an extended, iterative session with **Claude (Claude Code)**, used throughout rather than for one-off snippets:

- **Product/planning:** Drafted an execution-ready PRD (`docs/PRD.md`) and an evidence-backed, prioritized ticket backlog (`BACKLOG.md`) before implementation.
- **Implementation:** Built the full stack — auth, channels/DMs, realtime SSE, reactions, search, moderation, message editing, typing indicators, file uploads — ticket by ticket, with the agent running its own build/lint/unit/Playwright E2E suite after each change rather than reporting work as done unverified.
- **Infra migration:** Migrated from a local SQLite prototype to a real Postgres database (Neon), rebuilt the realtime layer to relay across multiple server instances via Postgres `LISTEN`/`NOTIFY`, and moved rate limiting to a durable, concurrency-safe Postgres implementation — catching and fixing several genuine, non-obvious bugs that only surfaced once requests crossed a real network (a test race between an optimistic UI update and a page reload, an app/DB clock-skew bug in a rate limiter's time window, a concurrency race fixed with a Postgres advisory lock, and a dropped field in the realtime relay that would have leaked private messages across instances).
- **Verification discipline:** Live-verified flows in an actual browser (not just unit tests) throughout, including running two independent production server processes to prove cross-instance realtime and DM privacy, and performing a real Cloudinary upload verification (uploaded an image, confirmed it was genuinely served from Cloudinary's CDN, confirmed the message round-tripped correctly) rather than assuming the integration worked from code review alone.
- **Deployment:** Prepared the Render deploy blueprint (`render.yaml`) and README deploy instructions; the human account holder created the Render/Neon/Cloudinary accounts and supplied credentials (an agent cannot create third-party accounts or handle payment/credential entry), and the agent wired the resulting configuration in and verified the live deployment.

## How to review

1. Open https://commons-9pxt.onrender.com/signup and create an account.
2. Send a message in `#general`; open a second browser/incognito window as a different user to see it arrive live.
3. Start a DM from the presence list (click an online user's name).
4. Try reactions (hover a message), search (sidebar), and attaching an image (paperclip icon in the composer).
5. CI status and full test suite: see the README badge / `.github/workflows/ci.yml` in the repo.
