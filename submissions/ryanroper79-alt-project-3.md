# Project 3 Submission — @ryanroper79-alt

**Ryan R. Roper** · CEAL Green Energy Limited · Hult Cohort Developer Program · Summer Pilot 2026

Standalone vibe marketing platform at `participants/summer26/phase-1-project-3/ryanroper79-alt/` — Next.js App Router, TypeScript, Tailwind, cohort-first positioning with Comentiq-inspired partner surface.

## Production URL

https://cealgreen-projects.vercel.app

- **Vercel root:** `participants/summer26/phase-1-project-3/ryanroper79-alt`
- **Build repo:** [monorepo branch](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/participants/summer26/phase-1-project-3/ryanroper79-alt)
- **Submission PR (merged):** [#186](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186)
- **Sync PR (Phase 0–1 + partner surface):** [#201](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201)

## Sample profile URLs

- https://cealgreen-projects.vercel.app/p/ryanroper79-alt — featured builder, HBS + Caribbean infrastructure
- https://cealgreen-projects.vercel.app/p/CodingWCal
- https://cealgreen-projects.vercel.app/p/studmuffin01 — private opt-out placeholder

## Vibe / positioning notes

CARICOM energy gap narrative (47% target vs ~12% current). Every claim resolves to deploy, PR, or commit on `/work`. Ryan R. Roper spotlight: 20+ years major Caribbean project development, Harvard Business School (data analytics & AI), combining engineering, digital transformation, and energy transition. Partner enquiries are digital/AI + cohort engagement — not capital solicitation. Commercial resilient infrastructure at [cealgreen.com](https://www.cealgreen.com). Caribbean advisors linked on-site. **Vote:** [/vote](https://cealgreen-projects.vercel.app/vote)

## Partner-facing README

https://cealgreen-projects.vercel.app/partners/readme

## Architecture (summary)

| Layer | Files |
|-------|-------|
| Roster + privacy | `data/roster.ts`, `data/participants.ts` |
| Work ledger | `data/ledger.ts`, `/work`, `/api/verify` |
| Partner pipeline | `/partners`, `/api/partner`, `/partners/solutions` |
| Builder directory | `/builders`, `FeaturedBuilderSpotlight` |
| Showcase RSVP | `/rsvp`, `/api/rsvp` |
| Governance | `/contribute`, `/status`, CI workflow |

## Setup

```bash
cd participants/summer26/phase-1-project-3/ryanroper79-alt
npm install && npm run dev
```

## Test plan

```bash
npm run typecheck
npm run build
npm run smoke-test https://cealgreen-projects.vercel.app
```

Manual: partner form, RSVP, private profile at `/p/studmuffin01`, vote issue pre-fill at `/vote`.

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Public homepage (≥200 words) | ✓ CARICOM narrative |
| Student profiles | ✓ `/p/{handle}` + OG images |
| Portfolio links | ✓ Ledger weeks 1–3 with deploy/PR URLs |
| PM integration (read-only) | ✓ Ledger + `/status` snapshot |
| `/partners` hire path | ✓ Fee model in PARTNERS.md + enquiry form |
| Request intro form | ✓ `/partners` + `/api/partner` |
| Privacy opt-out | ✓ `/p/studmuffin01` private placeholder |
| SEO | ✓ sitemap, robots, OG, llms.txt |
| Showcase RSVP | ✓ `/rsvp` |
| HTTPS public deploy | ✓ cealgreen-projects.vercel.app |
| README + AGENTS.md | ✓ |

## Known limitations

- Roster seed: 11 handles (expand via `/join` PR flow toward full enrolled count)
- Email notifications require `RESEND_API_KEY` or `GITHUB_TOKEN` on Vercel
- Calendly embed optional until `NEXT_PUBLIC_CALENDLY_URL` configured

## Agent usage

- Research: Project 3 curriculum, cohort-first pivot, Comentiq partner patterns
- Dev: ledger, verify API, Ryan spotlight, partner/builder/solution surfaces, RSVP, privacy
- QA: build, typecheck, smoke-test, Vercel production deploy

## Vote for this submission

Peers: [/vote](https://cealgreen-projects.vercel.app/vote) → GitHub issue with `Vote: up`
