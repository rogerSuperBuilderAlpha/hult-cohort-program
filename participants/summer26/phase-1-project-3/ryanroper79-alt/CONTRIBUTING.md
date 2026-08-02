# Contributing — Hult Cohort Showcase

**Repo path:** `participants/summer26/phase-1-project-3/ryanroper79-alt/`

## Claim-first rule

1. Open or comment on a GitHub issue before writing code.
2. One issue per PR. Do not bundle unrelated changes.
3. If an issue is already claimed, pick another from the backlog.

## Protected areas (maintainer approval required)

- `data/cohort.ts` — positioning and production URLs
- `scripts/smoke-test.mts` — production acceptance checks
- Vercel project settings and deployment protection

## Required checks before merge

Every PR must pass:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- Lighthouse ≥ 90 on `/`, `/work`, and `/p/{handle}` (performance, accessibility, best practices, SEO)
- Zero critical axe violations on the same routes

CI runs automatically on PRs touching this directory.

## How to publish your profile (< 2 minutes)

See `/join` on the live site for a copy-paste `participants.ts` snippet and GitHub edit link.

## Maintainer policy

The maintainer may decline duplicate, unscoped, or failing work. Evidence over assertion — no fabricated deploy URLs or PR numbers in the ledger.

## Contact

Open an issue on [ryanroper79-alt/hult-cohort-program](https://github.com/ryanroper79-alt/hult-cohort-program) or use `/join` on the live deploy.
