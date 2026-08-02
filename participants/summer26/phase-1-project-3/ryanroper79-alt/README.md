# CEAL Green Projects — Hult Cohort Showcase

**Public hiring showcase for the Hult Cohort Developer Program · Summer Pilot 2026 · Project 3**

Production: **https://cealgreen-projects.vercel.app**

Ryan R. Roper (CEAL Green) operates this cohort-first vibe marketing platform — builder profiles, a three-week work ledger with live verification, partner enquiry flows, and end-of-pilot showcase RSVP. Commercial Caribbean infrastructure work lives off-platform at [cealgreen.com](https://www.cealgreen.com).

## Setup

```bash
cd participants/summer26/phase-1-project-3/ryanroper79-alt
npm install
cp .env.example .env.local   # optional — tokens for forms + verify API
npm run dev                    # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build (enriches GitHub roster cache first) |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run smoke-test [url]` | HTTP checks against production or preview |
| `npm run scale-check` | Roster scale guardrails |

## Architecture

- **Next.js 15 App Router** — static-first pages with server routes for forms and verification
- **`data/roster.ts`** — client-safe participant roster (privacy flags, featured builder)
- **`data/participants.ts`** — server enrichment with cached GitHub avatars
- **`data/ledger.ts`** — cross-cohort work index for weeks 1–3
- **`lib/verify.ts`** — GitHub PR + deploy HEAD checks (`/api/verify`, chips on `/work`)
- **Forms** — `/api/partner`, `/api/join`, `/api/rsvp` → Resend email or GitHub issues when `GITHUB_TOKEN` set
- **Deploy** — Vercel; monorepo root directory `participants/summer26/phase-1-project-3/ryanroper79-alt`

## Core routes

| Route | Purpose |
|-------|---------|
| `/` | Cohort narrative + Ryan spotlight + solutions preview |
| `/work` | Three-week ledger + live verify chips |
| `/p/{handle}` | Builder profile (private opt-out supported) |
| `/builders` | Comentiq-style directory |
| `/partners` | Partner enquiry + Ryan R. Roper spotlight |
| `/partners/solutions` | Digital/AI solution catalog |
| `/partners/readme` | Rendered PARTNERS.md |
| `/rsvp` | End-of-pilot showcase registration |
| `/vote` | Cohort peer review helper (GitHub issue pre-fill) |
| `/join` | Self-serve roster PR snippet |
| `/status` | CI badge + verify summary |

## Environment variables

See `.env.example`. Key vars:

- `GITHUB_TOKEN` — partner/join/RSVP issues + live verify
- `RESEND_API_KEY` + `PARTNER_NOTIFY_EMAIL` — email notifications
- `NEXT_PUBLIC_CALENDLY_URL` — optional Calendly embed on `/partners`

## Known limitations

- Roster seed covers 11 enrolled handles; expand toward full cohort via PR to `data/roster.ts`
- Partner/RSVP email requires Resend or GitHub token — otherwise server log fallback
- PM integration is a read-only ledger snapshot + `/status`, not a live PM API
- Private profiles show placeholders only (see `/p/studmuffin01`)

## Submission & voting

- **Submission PR (merged):** [#186](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186)
- **Sync PR (Phase 0–1 + partner surface):** [#201](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201)
- **Peer vote:** file a GitHub issue via [/vote](https://cealgreen-projects.vercel.app/vote) with `Vote: up`

## Maintainer

**Ryan R. Roper** · CEAL Green Energy Limited · [@ryanroper79-alt](https://github.com/ryanroper79-alt)

MIT-licensed cohort submission code unless otherwise noted.
