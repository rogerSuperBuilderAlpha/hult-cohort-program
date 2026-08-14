# Lighthouse

**Public cohort showcase for hiring partners — Hult Cohort Program · Phase 1 Project 3**

Lighthouse is the outward-facing hiring surface for the Summer Pilot. Browse participant profiles, open GitHub and deploy URLs, read a PM-platform status snapshot, request intros, and RSVP to the end-of-pilot showcase.

> Visual identity is **signal / night** — independent of Forth (Project 1) and Fireside (Project 2).

## Features (MVP)

- **Public homepage (`/`)** — brand hero, seeded activity preview, journey timeline, cohort narrative
- **Projects** — showcase pages (Problem / Solution / Proof / Deploy)
- **Live** — seeded activity feed (labeled sample — not live webhooks)
- **Sign-in (`/signin`)** — optional demo identity; does not gate the showcase
- **Developers directory** — search + filter by campus/skill; private opt-outs respected
- **Profiles** (`/developers/[handle]`) — Why I’m Here, build log, links, project showcase, activity
- **Partners** — industry list, fee summary, request-intro (interest types)
- **Testimonials** — partner / peer / mentor quotes
- **RSVP** — end-of-pilot showcase registration
- **SEO** — titles, descriptions, Open Graph basics

## Quick start

```bash
cd submissions/studmuffin01-project-3
npm install
cp .env.example .env.local
npm run dev
```

**Production:** [https://lighthouse-studmuffin01.vercel.app](https://lighthouse-studmuffin01.vercel.app)

Locally: open [http://localhost:3000](http://localhost:3000) — public showcase at `/`. Optional demo sign-in at `/signin`.

**Reviewers:** see [REVIEWER.md](./REVIEWER.md).  
**Hiring partners (copy):** see [PARTNERS.md](./PARTNERS.md).

## Ecosystem links (data only — not shared UI)

| Platform | Env | Default |
|----------|-----|---------|
| Forth (PM) | `NEXT_PUBLIC_FORTH_URL` | https://forth-bice.vercel.app |
| Fireside (comms) | `NEXT_PUBLIC_FIRESIDE_URL` | https://fireside-studmuffin01.vercel.app |

PM integration is a **read-only synced snapshot** in `lib/pm-snapshot.ts` (daily-update stand-in until live API).

## Author

**Rawle Arneaud** · Hult Cohort Program · Phase 1 Project 3
