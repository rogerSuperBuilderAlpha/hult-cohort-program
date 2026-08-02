# Project 3 Submission — @ryanroper79-alt

**Hult Cohort - Climate Builder Network** — digital participants solving climate problems for the Caribbean and global Small Island Developing States.

## Production URL

https://cealgreen-projects.vercel.app

Vercel root: `participants/summer26/phase-1-project-3/ryanroper79-alt`

## Sample profile URLs

- https://cealgreen-projects.vercel.app/p/ryanroper79-alt
- https://cealgreen-projects.vercel.app/p/CodingWCal
- https://cealgreen-projects.vercel.app/p/studmuffin01 (private opt-out)

## Vibe / positioning notes

Cohort-first, evidence-first climate showcase. Artifact scorecards on `/work` (Lighthouse, transfer weight, mobile TTI) score **deploy URLs only** — never participants. Privacy opt-out and opt-in `availableForEngagement` flag (default false, self-serve via `/join`). No marketplace, ratings, or commercial language on-site. Vote: `/vote`.

## Partner-facing README

https://cealgreen-projects.vercel.app/partners/readme

## Architecture

Next.js 15 · roster in `data/roster.ts` · ledger in `data/ledger.ts` · artifact checks cached at build via PSI mobile · `/api/verify` for PR/deploy health.

## Setup & test

```bash
cd participants/summer26/phase-1-project-3/ryanroper79-alt
npm install && npm run typecheck && npm run build && npm run smoke-test
```

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Public homepage | ✓ Climate narrative |
| Participant profiles | ✓ `/p/{handle}` |
| Portfolio / ledger links | ✓ `/work` |
| PM integration snapshot | ✓ Ledger + `/status` |
| `/partners` + intro form | ✓ |
| Privacy opt-out | ✓ |
| Showcase RSVP | ✓ `/rsvp` |
| Artifact quality scorecards | ✓ Addition A |
| Engagement opt-in flag | ✓ Addition B |
| README + AGENTS.md | ✓ |

## Vote

https://cealgreen-projects.vercel.app/vote
