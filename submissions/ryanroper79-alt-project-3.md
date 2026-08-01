# Project 3 Submission — @ryanroper79-alt

Standalone vibe marketing platform at `participants/summer26/phase-1-project-3/ryanroper79-alt/` — Next.js App Router, TypeScript, Tailwind, static `data/participants.ts`.

## Production URL

https://cealgreen-projects.vercel.app

Vercel root directory: `participants/summer26/phase-1-project-3/ryanroper79-alt` (CEAL Green team project).

## Sample profile URLs

- https://cealgreen-projects.vercel.app/p/ryanroper79-alt
- https://cealgreen-projects.vercel.app/p/raven-dubgub
- https://cealgreen-projects.vercel.app/p/gge513

## Vibe / positioning notes

Primary audience: partners, sponsors, and capital partners — Caribbean infrastructure investors evaluating CEAL Green feasibility studies and cohort software capability.

Thesis: energy sovereignty requires digital sovereignty. Target belief: these people build deployable software against real Caribbean infrastructure problems in weeks.

Primary call to engage: request a feasibility report — choose wave energy, solar farms, or modular homes.

Design: CEAL Green palette (mangrove green, sun yellow, white), Instrument Serif + Source Sans + IBM Plex Mono, signature element A — the build curve.

Architecture: typed static roster; peers join via `/join` (GitHub issue or mailto fallback); profiles publish on redeploy.

## Partner-facing README

`participants/summer26/phase-1-project-3/ryanroper79-alt/PARTNERS.md`

On-site: https://cealgreen-projects.vercel.app/partners

## Agent usage

- Research: Project 3 curriculum, CEAL Green brand guidelines, build plan phases 0–7
- Dev: standalone app (homepage pitch, `/work`, `/partners`, `/join`, `/p/[handle]` + OG images), smoke/scale scripts
- QA: `npm run build`, `tsc --noEmit`, `npm run smoke-test` (13/13), `npm run scale-check`; Vercel production deploy verified
