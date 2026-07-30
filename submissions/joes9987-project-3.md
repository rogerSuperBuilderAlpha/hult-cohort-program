# Project 3 Submission — @joes9987

Summer Pilot 2026, Project 3 — **EudaMarket** (public showcase platform).

## Production URL

https://showcase-joes9987.vercel.app

Build repo (public): https://github.com/joes9987/showcase-joes9987

Partner-facing README: https://github.com/joes9987/showcase-joes9987/blob/main/README.md

## Sample profile URLs

- https://showcase-joes9987.vercel.app/people/joes9987
- https://showcase-joes9987.vercel.app/people/CodingWCal
- https://showcase-joes9987.vercel.app/people/nikjain15

People index: https://showcase-joes9987.vercel.app/people

## PM / Forth status

PM status is shown from a committed Forth snapshot (`data/forth-status.json`, source https://forth-bice.vercel.app) plus portfolio deep links to EudaPM / EudaChat deploys. Refresh path: `npm run sync:forth`.

## Architecture summary

- Next.js 16 App Router + Tailwind 4 + `next-themes` on Vercel
- Same Supabase project as EudaPM / EudaChat (`vidprovlxevofniwyhgs`)
- New tables only: `showcase_members`, `partner_requests` (RLS: public read non-opt-out; anon insert intros; claim/update own row)
- Public routes: `/`, `/people`, `/people/[handle]`, `/partners`, `/suite`
- Optional claim/edit at `/app/profile` (same email as PM/Chat; per-host cookies)
- Partner intro: `POST /api/partner-intro` persists always; emails placement lead when `RESEND_API_KEY` is set

## Smoke test (2026-07-30)

- [x] Repo public: `https://github.com/joes9987/showcase-joes9987` with `AGENTS.md` + partner-facing `README.md`
- [x] Deploy: `https://showcase-joes9987.vercel.app` → `/`, `/people/joes9987`, `/partners` 200
- [x] Homepage narrative ≥ 200 words
- [x] Roster profiles seeded for enrolled handles (opt-out → private placeholder)
- [x] GitHub + portfolio/deploy links on profiles
- [x] Forth / PM status strip visible on home and profiles
- [x] `/partners` request-intro persists to `partner_requests`
- [x] SEO: title/description/OG + `robots.ts` / `sitemap.ts`
- [x] No secrets in git (`.env.example` only)

## Agent usage

Cursor agents implemented scaffold, migration/seed, public pages, partner API, deploy, and this cohort submission artifact.

## Known limitations

- Forth has no public API — status is a daily JSON snapshot, not a live scrape
- No silent SSO across `*.vercel.app` hosts
- Partner login portal deferred to Week 5 winner obligations
