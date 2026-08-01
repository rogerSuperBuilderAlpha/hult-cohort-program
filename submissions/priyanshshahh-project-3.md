# Project 3 Submission — @priyanshshahh

**shiplog** — the Summer Pilot 2026 cohort's vibe marketing platform. Project 3.

## Production URL

https://shiplog-snowy.vercel.app

Build repo: https://github.com/priyanshshahh/shiplog

## Sample profile URLs

- https://shiplog-snowy.vercel.app/cohort/priyanshshahh
- https://shiplog-snowy.vercel.app/cohort/RamyaTolety
- https://shiplog-snowy.vercel.app/cohort/CodingWCal
- https://shiplog-snowy.vercel.app/cohort (full roster)
- https://shiplog-snowy.vercel.app/me (claim / edit after GitHub sign-in)
- https://shiplog-snowy.vercel.app/partners
- https://shiplog-snowy.vercel.app/status
- https://shiplog-snowy.vercel.app/rsvp

## Vibe / positioning notes

**One-liner:** Proof of work, not a portfolio — every ship is a merged cohort PR plus a live deploy, and peer `Vote: up` stays on GitHub.

**Tone:** terminal / GitHub-native. Card roster, activity ticker, contributor wall, partner intro + RSVP, Keel PM pulse, light/dark theme.

**Audience:** hiring partners; secondary, peers reviewing during contest week.

**Differentiators:**
- GO LIVE from merged PRs on `projects/summer26/phase-1-project-{1,2,3}` (sync + webhook)
- Member-owned profiles and ships via GitHub OAuth (`/signin`, `/me`) with screenshot uploads (Vercel Blob)
- On-site comments for conversation; ballot stays on GitHub review issues
- Request-intro + RSVP to cohort@hult.edu; privacy opt-out; OG/SEO
- No fabricated tallies; 67 is enrolledCount, not a cohort name

## Partner-facing README

https://github.com/priyanshshahh/shiplog/blob/main/README.md

Also on-site: https://shiplog-snowy.vercel.app/partners

## Architecture summary

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Auth.js (GitHub) + Neon Postgres (Drizzle) + Vercel Blob. Static roster seed overlays with DB. Sync from GitHub merges. API routes for profile, projects, comments, sync, webhook, upload, request-intro, RSVP.

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/priyanshshahh/shiplog.git
cd shiplog
cp .env.example .env.local   # DATABASE_URL + AUTH_* (+ BLOB for uploads)
npm install
npm run build
npm run dev
```

## Agent usage

- Research: cohorts.algorithmacy.org Week 3 brief, Debut deep-inspect, curriculum requirements, peer Project 3 merges.
- Dev: Neon + GitHub OAuth, merge sync / webhook, `/me` editor, Blob screenshots, comments, GO LIVE banner, keep roster/partners/status.
- QA: `next build` clean; production redeploy; sync of week 1–3 merges; profile/ship save + upload verified path.

## Test plan

- [x] Production URL HTTPS
- [x] Sample profiles + roster
- [x] /partners intro form + /rsvp
- [x] Fresh clone build
- [x] GitHub OAuth sign-in + /me
- [x] Merge sync seeds ships from cohort PRs
- [x] Screenshot upload + profile/ship save
- [ ] Peer UI / Vote: up review week
