# Project 3 Submission — @joes9987

Summer Pilot 2026, Project 3 — **EudaMarket** (public showcase platform).

## Production URL

https://showcase-joes9987.vercel.app

Build repo (public): https://github.com/joes9987/showcase-joes9987

Partner-facing README: https://github.com/joes9987/showcase-joes9987/blob/main/README.md

Reviewer SCORECARD (/25): https://github.com/joes9987/showcase-joes9987/blob/main/SCORECARD.md

## Sample profile URLs

- https://showcase-joes9987.vercel.app/people/joes9987
- https://showcase-joes9987.vercel.app/people/CodingWCal
- https://showcase-joes9987.vercel.app/people/nikjain15

People index (search/filter): https://showcase-joes9987.vercel.app/people  
Privacy demo (opt-out): https://showcase-joes9987.vercel.app/people/rebekah-dev  
Partners + intro + RSVP: https://showcase-joes9987.vercel.app/partners  
Suite deep links: https://showcase-joes9987.vercel.app/suite

## Partner-facing homepage

Homepage narrative (“Why this cohort is hireable”) is written for hiring partners: public GitHub proof, peer review, live deploys, Forth status, intro + fee path. Public copy describes a **connected suite with one participant account across EudaPM / EudaChat / EudaMarket** — not vendor/backend internals.

## PM / Forth status

PM status from a committed Forth snapshot (`data/forth-status.json`, source https://forth-bice.vercel.app) plus portfolio deep links to EudaPM / EudaChat deploys. Refresh: `npm run sync:forth`. UI badge: “Refreshed from live Forth · {timestamp}”.

## Roster / hiring story

- Seeded roster (`data/roster.json`) includes short bios, skills, campus where known, and portfolio repo/deploy links for known Phase 1 products
- GitHub avatar fallbacks when no custom avatar
- Home “Featured builders” ranks richer portfolio cards first
- Claim/edit at `/app/profile` (same email as EudaPM / EudaChat; per-host cookies)

## Architecture summary

- Next.js 16 App Router + Tailwind 4 + `next-themes` on Vercel
- Shared auth project with EudaPM / EudaChat (`vidprovlxevofniwyhgs`) — documented for operators in `AGENTS.md`; not exposed in partner marketing copy
- Tables: `showcase_members` (campus, skills, opt-out, links), `partner_requests`, `showcase_rsvps`
- Public routes: `/`, `/people` (filter), `/people/[handle]`, `/partners` (intro + RSVP), `/suite`
- Auth-aware header: Sign in → Claim → My profile / Edit / Sign out after claim
- Partner intro + RSVP: always persist; email placement lead via Resend when configured (`emailed: true` in prod smoke)
- Tests: `npm test` (vitest — partner intro parse, people filter, Forth snapshot)

## Smoke test

- [x] Repo public with `AGENTS.md`, partner-facing `README.md`, `SCORECARD.md`
- [x] Deploy HTTPS; public pages require no auth
- [x] Homepage narrative ≥ 200 words (partner-friendly; no backend leak)
- [x] Roster profiles with bios/skills + GitHub avatars + skill/project filter
- [x] Forth / PM status strip (real snapshot, refreshed badge)
- [x] Partner intro + showcase RSVP APIs (DB + Resend)
- [x] Opt-out private placeholder (`rebekah-dev`)
- [x] SEO + sitemap/robots
- [x] Auth-aware header after claim
- [x] `npm run build` + `npm test`

## Agent usage

Cursor agents implemented scaffold, migrations, public pages, auth-aware header, rubric hardening, partner narrative polish, roster enrichment, deploy, and this submission artifact.
