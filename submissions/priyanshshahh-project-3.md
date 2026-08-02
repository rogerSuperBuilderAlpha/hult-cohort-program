# Project 3 Submission — @priyanshshahh

**shiplog** — Summer Pilot 2026 vibe marketing platform. Proof of work, not a portfolio.

## Production URL

https://shiplog-snowy.vercel.app

Build repo: https://github.com/priyanshshahh/shiplog

Partner-facing README: https://github.com/priyanshshahh/shiplog/blob/main/README.md  
Peer reviewer guide: https://github.com/priyanshshahh/shiplog/blob/main/REVIEWER.md

## Sample profile URLs

- https://shiplog-snowy.vercel.app/cohort/priyanshshahh
- https://shiplog-snowy.vercel.app/cohort/RamyaTolety
- https://shiplog-snowy.vercel.app/cohort/CodingWCal
- https://shiplog-snowy.vercel.app/cohort (full roster)
- https://shiplog-snowy.vercel.app/me (GitHub sign-in → claim / edit)
- https://shiplog-snowy.vercel.app/partners
- https://shiplog-snowy.vercel.app/status
- https://shiplog-snowy.vercel.app/rsvp

## Vibe / positioning notes

**One-liner:** Proof of work, not a portfolio — every ship is a merged cohort PR plus a live deploy; peer `Vote: up` stays on GitHub.

**Tone:** terminal / GitHub-native. Card roster, activity ticker, contributor wall, partner intro + RSVP, Keel PM pulse, light/dark.

**Audience:** hiring partners first; peers during review week second.

**What shipped (review these):**
- Public homepage, roster (search + facets), profiles, privacy opt-out, SEO/OG, HTTPS
- GO LIVE: sync merged PRs from weeks 1–3 into Neon (`/api/sync` + webhook)
- Member ownership: GitHub OAuth → `/me` (bio, ships, WebP screenshots via Blob)
- Comments on profiles/projects (social only; ballot is GitHub)
- `/partners` request intro + `/rsvp` + `/status` PM pulse
- Image performance: `next/image`, sized avatars, compressed uploads
- No fabricated tallies; 67 = enrolledCount, not a cohort name

## Partner-facing README

https://github.com/priyanshshahh/shiplog/blob/main/README.md

Also: https://shiplog-snowy.vercel.app/partners

## Architecture summary

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · Auth.js (GitHub) · Neon (Drizzle) · Vercel Blob. Static seed in `src/data/roster.ts` overlays with DB. APIs: profile, projects, comments, sync, webhook, upload, request-intro, RSVP.

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/priyanshshahh/shiplog.git
cd shiplog
cp .env.example .env.local
npm install
npm run build
npm run dev
```

## Agent usage

- Research: Week 3 curriculum + dashboard, Debut, peer submissions, Lighthouse.
- Dev: ownership, merge GO LIVE, partners/RSVP/status, docs for reviewers, LCP fixes.
- QA: production build/deploy; sync; save profile/ship; upload path.

## Test plan

- [x] Production URL HTTPS
- [x] Sample profiles + roster + partners + status + RSVP
- [x] Fresh clone build
- [x] GitHub OAuth + `/me`
- [x] Merge sync + screenshot upload
- [x] README + REVIEWER.md for peer walkthrough
- [ ] Peer written reviews / optional Vote: up
