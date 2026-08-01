# Project 3 Submission — @raven-dubgub

**Joshua Scotland** · Hult Cohort Developer Program · Summer 2026 · Project 3 (Vibe marketing / public showcase)

**Production URL:** https://showcase-raven-dubgub.vercel.app  
**Repo:** https://github.com/RAVEN-dubgub/showcase-raven-dubgub  
**Partner-facing README:** https://github.com/RAVEN-dubgub/showcase-raven-dubgub/blob/main/PARTNERS.md

## Production URL

https://showcase-raven-dubgub.vercel.app

## Sample profile URLs

- https://showcase-raven-dubgub.vercel.app/students/raven-dubgub
- https://showcase-raven-dubgub.vercel.app/students/CodingWCal
- https://showcase-raven-dubgub.vercel.app/students/gge513
- https://showcase-raven-dubgub.vercel.app/students/priyanshshahh

## Vibe / positioning notes

Hiring-partner facing surface with Hult cream / magenta / ink branding. Headline promise: **Don't trust our word — inspect their GitHub.** Profiles link live PM/Comms deploys from cohort submission evidence; `/status` shows a real PM + live enrolled-count snapshot (not lorem). Partners get fee model, intro form, and showcase RSVP in one flow.

## Partner-facing README

- In-repo: `PARTNERS.md` → https://github.com/RAVEN-dubgub/showcase-raven-dubgub/blob/main/PARTNERS.md
- Also summarized on-site at `/partners`

## Summary

Public HTTPS showcase with:

| Requirement | Shipped |
|-------------|---------|
| Public homepage + ≥200-word narrative | Yes |
| Student profiles (GitHub, bio, campus, skills) | Yes — 33 evidence-backed profiles |
| Portfolio links (pm/comms/showcase + deploys) | Yes where submissions published URLs |
| PM integration (read-only status) | `/status` + `/api/pm-status` + live cohort stats |
| `/partners` hire path + fee model | Yes (25% / clawback / contact) |
| Request intro → placement lead | Yes (Postgres + optional SMTP) |
| Privacy opt-in default / opt-out private | Yes (`/api/privacy`) |
| SEO (title, meta, OG, sitemap, robots) | Yes |
| Event RSVP | `/event` |
| Search/filter by skill | `/students` |

## Architecture summary

Next.js 16 App Router + Prisma + PostgreSQL (Neon) + Vercel.

```
Browser → Next.js (Vercel) → Prisma → Neon
              │
     roster JSON + PM snapshot JSON
     live GET site-nine /api/cohort/stats
```

## Agent usage

- Research: curriculum `project-3-public-showcase`, `program.ts` slug `phase-1-project-3`, hiring-partners.md
- Dev: Scaffolded `showcase-raven-dubgub`; Neon project `showcase-raven-dubgub`; Vercel prod deploy
- QA: Production smoke — homepage, profiles, status, partners, intro API 200

## How to review

1. Open https://showcase-raven-dubgub.vercel.app
2. Browse `/students` and open the sample profiles above
3. Confirm `/status` shows live enrolled count + Phase 1 project table
4. Submit a test intro on `/partners#request-intro`
5. Skim `PARTNERS.md` for fee model / evaluation path

## Known limitations

- Full Firestore roster (67 enrolled) is not exposed publicly; profiles cover submission/PR-evidence handles (33). Remaining enrolled members can be added when handles are published.
- SMTP optional — without `SMTP_*` env, intro requests persist in Neon (`notified: false`) for placement lead follow-up; set SMTP for ≤1 min email.
- PM task-level metrics require auth on pm-raven-dubgub; public integration uses daily snapshot JSON + cohort platform stats.

## Test plan

- [x] Production URL returns 200
- [x] Sample profiles load (raven-dubgub, CodingWCal, gge513)
- [x] `/status` and `/api/pm-status` return real data
- [x] Intro API persists request (`ok: true`)
- [ ] Peer review of UI/credibility (reviewer)
- [ ] Optional: configure SMTP and confirm placement email delivery
