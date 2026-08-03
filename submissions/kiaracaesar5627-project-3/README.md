# Trailmark — Vibe marketing showcase (Project 3)

Public vibe marketing surface for the **Hult Cohort Developer Program · Summer Pilot 2026**.
Alive profiles, project evidence, PM status from FlexiFlow, and partner hiring flows.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://kiaracaesar5627-project-3.vercel.app

Sample profiles:

- https://kiaracaesar5627-project-3.vercel.app/people/kiaracaesar5627
- https://kiaracaesar5627-project-3.vercel.app/people/demo-alex-rivera-01
- https://kiaracaesar5627-project-3.vercel.app/people/demo-priya-patel-04

Partner brief: [PARTNERS.md](./PARTNERS.md) · `/partners/readme`

## Stack

- **Next.js 15** App Router + **React 19** + **TypeScript** on **Vercel**
- Static cohort roster + daily **PM snapshot** (`data/pm-status.json`)
- Intro / RSVP APIs with optional Resend email to placement lead
- Bunny Fonts (Syne + Manrope) — no build-time Google font fetch

## Baseline features

| Feature | Route / note |
|---------|----------------|
| Public homepage (≥200 words narrative) | `/` |
| Student profiles + privacy opt-out | `/people`, `/people/[handle]` |
| Portfolio / deploy links | Profile evidence section |
| PM integration | `/work` + `GET /api/pm-status` |
| Partners + fee model | `/partners` |
| Request intro | `/partners/intro` → `POST /api/intro` |
| Showcase RSVP | `/rsvp` → `POST /api/rsvp` |
| SEO | titles, meta, OG, `sitemap.xml`, `robots.txt` |

## Setup

```bash
cd submissions/kiaracaesar5627-project-3
cp .env.example .env.local
npm install
npm run build
npm run dev
```

Open http://localhost:3000

### Env

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for OG + sitemap |
| `NEXT_PUBLIC_PM_URL` | FlexiFlow deep link (default `https://pilot-hult-pm.vercel.app`) |
| `NEXT_PUBLIC_COMMS_URL` | Huddle deep link (default `https://pilot-hult-comms.vercel.app`) |
| `PLACEMENT_LEAD_EMAIL` | Optional notify target |
| `RESEND_API_KEY` | Optional email delivery for intro/RSVP |

Without Resend, requests are stored in-memory and logged (fine for demo / review week).

## PM integration

`data/pm-status.json` is the durable snapshot partners see. Refresh it from FlexiFlow
(or replace with a fetch in week-5 unification). Ballot requirement: board shows real
project rows, not lorem.

## Agent usage

Built with Cursor agents against the Project 3 curriculum
(`curriculum/phase-1/project-3-public-showcase/`).
