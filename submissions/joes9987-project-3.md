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

## PM / Forth status

PM status is shown from a committed Forth snapshot (`data/forth-status.json`, source https://forth-bice.vercel.app) plus portfolio deep links to EudaPM / EudaChat deploys. Refresh path: `npm run sync:forth`. UI badge: “Snapshot from Forth · not lorem”.

## Architecture summary

- Next.js 16 App Router + Tailwind 4 + `next-themes` on Vercel
- Same Supabase project as EudaPM / EudaChat (`vidprovlxevofniwyhgs`)
- Tables: `showcase_members` (campus, skills, opt-out), `partner_requests`, `showcase_rsvps`
- Public routes: `/`, `/people` (filter), `/people/[handle]`, `/partners` (intro + RSVP), `/suite`
- Auth-aware header: Sign in → Claim → My profile / Edit / Sign out after claim
- Partner intro + RSVP: persist always; email placement lead via Resend when configured
- Tests: `npm test` (vitest — partner intro parse, filter, Forth snapshot)

## Smoke test

- [x] Repo public with `AGENTS.md`, partner-facing `README.md`, `SCORECARD.md`
- [x] Deploy HTTPS; public pages require no auth
- [x] Homepage narrative ≥ 200 words
- [x] Roster profiles + GitHub avatars + skill filter
- [x] Forth / PM status strip (real snapshot)
- [x] Partner intro + showcase RSVP APIs
- [x] Opt-out private placeholder (`rebekah-dev`)
- [x] SEO + sitemap/robots
- [x] `npm run build` + `npm test`

## Agent usage

Cursor agents implemented scaffold, migrations, public pages, auth-aware header, rubric hardening, deploy, and this submission artifact.
