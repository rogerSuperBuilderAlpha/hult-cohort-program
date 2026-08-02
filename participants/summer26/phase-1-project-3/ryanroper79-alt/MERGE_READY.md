# Administrator merge checklist — @ryanroper79-alt

**PR to merge:** [#201](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201)  
**Base:** `projects/summer26/phase-1-project-3`  
**Head:** `participants/summer26/phase-1-project-3/ryanroper79-alt`  
**Original submission (merged):** [#186](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186)

## Production (verify before merge)

| Check | URL / command |
|-------|----------------|
| Live site | https://cealgreen-projects.vercel.app |
| Work ledger + artifact scorecards | https://cealgreen-projects.vercel.app/work |
| Vote helper | https://cealgreen-projects.vercel.app/vote |
| Partner README | https://cealgreen-projects.vercel.app/partners/readme |
| Local CI | `cd participants/summer26/phase-1-project-3/ryanroper79-alt && npm run typecheck && npm run build && npm run smoke-test` |

## Required PR body sections (all present in #201)

1. **Production URL** — https://cealgreen-projects.vercel.app  
2. **Sample profiles** — `/p/ryanroper79-alt`, `/p/CodingWCal`, `/p/studmuffin01`  
3. **Vibe / positioning** — Hult Cohort - Climate Builder Network; scope freeze compliant  
4. **Partner README** — `/partners/readme`

## Project 3 requirements matrix

| Requirement | Evidence |
|-------------|----------|
| Public homepage ≥200 words | `/` narrative in `data/cohort.ts` |
| Participant profiles | `/p/{handle}` (11 roster; private opt-out demo) |
| Portfolio / deploy links | `/work` ledger weeks 1–3 |
| PM integration (read-only) | Featured Week 1/2 infra + `/status` |
| `/partners` + intro form | `/partners` → `/api/partner` |
| Privacy opt-out | `/p/studmuffin01` |
| SEO / OG | `app/layout.tsx`, sitemap, robots, OG images |
| Showcase RSVP | `/rsvp` |
| README + AGENTS.md | repo root of build folder |
| Addition A — artifact scorecards | `/work` + `scripts/enrich-artifact-checks.mts` |
| Addition B — engagement opt-in | `availableForEngagement` in `data/roster.ts`, default false |

## CI status on #201

| Check | Expected |
|-------|----------|
| **quality** (GitHub Actions) | Pass — typecheck + build |
| **Vercel** | May show "Authorization required" on upstream PR; production already deployed via `ceal-green/cealgreen-projects` |

## Scope freeze compliance

- No marketplace, client intake ratings, leaderboards, or per-person scores  
- No participant labeled "Builder" in public UI (network name only)  
- No commercial, pricing, or investment language on-site  
- `/builders` and `/partners/solutions` redirect away from retired surfaces  

## Post-merge

Vercel root directory unchanged: `participants/summer26/phase-1-project-3/ryanroper79-alt`
