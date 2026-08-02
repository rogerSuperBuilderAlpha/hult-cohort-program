# Hult Cohort - Climate Builder Network

Public showcase for the Hult Cohort Developer Program · Summer Pilot 2026 · Project 3.

**Production:** https://cealgreen-projects.vercel.app

A platform where digital participants ship climate software for the **Caribbean and global Small Island Developing States** — indexed in public with deploy evidence, artifact quality scorecards, and peer review.

## Setup

```bash
cd participants/summer26/phase-1-project-3/ryanroper79-alt
npm install
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Enrich roster + artifact checks, then Next.js build |
| `npm run typecheck` | TypeScript |
| `npm run smoke-test [url]` | Production smoke checks |

## Scope (Project 3 freeze)

- **No** marketplace, ratings, leaderboards, tiers, or per-person scores
- **No** commercial, pricing, or investment language on-site
- Artifact scorecards on `/work` score **deploy URLs only**
- `availableForEngagement` defaults **false** — participants opt in via `/join` PR

## Key routes

| Route | Purpose |
|-------|---------|
| `/work` | Cross-cohort ledger + artifact quality scorecards |
| `/p/{handle}` | Participant profile (private opt-out supported) |
| `/partners` | Cohort introduction request |
| `/join` | Self-serve roster PR snippet |
| `/vote` | Peer review helper |

## Submission

- PR [#186](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/186) (merged)
- Sync [#201](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/201)

MIT-licensed cohort submission.
