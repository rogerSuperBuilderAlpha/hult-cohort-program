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
- https://shiplog-snowy.vercel.app/launch (Debut-style launch board)

## Vibe / positioning notes

**One-liner:** OpenAI-grade credibility meets Debut-style launch momentum — every ship is a
merged PR + live deploy, and peer `Vote: up` stays on GitHub (program rule).

**Tone:** terminal / GitHub-native. Liquid-glass nav, 3D page-stack transitions, launch board
with sort/search/micro-tags, social pulse of merges + review issues, contributor wall from the
cohort program repo, partner intro + RSVP, Keel PM pulse.

**Audience:** hiring partners; secondary, peers reviewing during contest week.

**Differentiators:** GitHub-native review/Vote: up CTAs on every launch row; links to
https://cohorts.algorithmacy.org/dashboard; active contributors from the program repo;
request-intro + RSVP APIs to cohort@hult.edu; privacy opt-out placeholder; OG/SEO metadata;
no fabricated tallies or "Cohort 67" branding (67 = enrolledCount).

## Partner-facing README

https://github.com/priyanshshahh/shiplog/blob/main/README.md

Also on-site: https://shiplog-snowy.vercel.app/partners

## Architecture summary

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion.
API routes for request-intro + RSVP. Roster/PM/contributors static data grounded in GitHub +
cohort stats API.

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/priyanshshahh/shiplog.git
cd shiplog
npm install
npm run build
npm run dev
```

## Agent usage

- Research: official dashboard (cohorts.algorithmacy.org/dashboard), Debut via Chrome DevTools,
  buildnatively/openai/rapidnative showcases, 8 peer Project 3 apps, skills.sh
  (frontend-design, web-design-guidelines, design-taste, accessibility, seo).
- Dev: launch board, social pulse, contributor wall, PM panel, intro/RSVP APIs, review CTAs,
  OG metadata, privacy stub.
- QA: tsc, eslint, next build clean; routes / /launch /cohort /partners /rsvp /status /api/*.

## Test plan

- [x] Production URL HTTPS
- [x] Sample profiles + launch board
- [x] /partners intro form + /rsvp
- [x] Fresh clone build
- [ ] Peer UI / Vote: up review week
