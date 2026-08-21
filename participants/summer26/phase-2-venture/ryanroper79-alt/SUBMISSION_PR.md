# P2-Venture PR body — @ryanroper79-alt

## Summary

Greenularity Caribbean™ public demonstration: authenticated Energy Auditor calculator, sanitized venture materials (business plan, marketing & investment plan, elevator pitch, market research, investor deck), and traceable Ludwitt/Hult user metrics evidence.

## Investor deck link (in repo)

`participants/summer26/phase-2-venture/ryanroper79-alt/docs/pitch-deck.md`

## Business plan path

`participants/summer26/phase-2-venture/ryanroper79-alt/docs/business-plan.md`

## Marketing & investment plan path

`participants/summer26/phase-2-venture/ryanroper79-alt/docs/marketing-investment-plan.md`

## Elevator pitch path

`participants/summer26/phase-2-venture/ryanroper79-alt/docs/elevator-pitch.md`

## Market research path

`participants/summer26/phase-2-venture/ryanroper79-alt/docs/market-research.md`

## In-app venture materials

https://caribbeanenergyauditor.vercel.app/venture

## App URL + user metrics

- Production URL: https://caribbeanenergyauditor.vercel.app
- Venture materials: https://caribbeanenergyauditor.vercel.app/venture
- Launch URL: https://caribbeanenergyauditor.vercel.app/launch
- Ludwitt Creator (registered): https://www.ludwitt.com/creator/apps/le_f020a1a048a68382b29a69
- Ludwitt Marketplace browse: https://www.ludwitt.com/dashboard/marketplace
- Authentication: Required for calculator (home sign-in or Ludwitt OAuth)
- Metrics source: Ludwitt/Hult reference API (persistent host required — not Vercel serverless)
- Snapshot date: 2026-08-15T01:09:34.589Z
- Qualification rule: Authenticated opaque user ID with calculator_completed event
- Qualified external users: **2** (gate: **≥25** — not pass-ready; do not submit snapshot until ≥25)
- Evidence path: `participants/summer26/phase-2-venture/ryanroper79-alt/evidence/metrics-snapshot-2026-08-15.json`
- Privacy: Public evidence contains no names, emails or other PII

## Submission status (2026-08-15 verification)

| Gate | Status |
|------|--------|
| Merged P2-Venture PR to `rogerSuperBuilderAlpha/hult-cohort-program` | **Not yet opened** |
| Investor engagement in PR | **2 entries** in `INVESTOR_LOG.md` (awaiting PR) |
| ≥25 qualified external users | **Not met** (2 in last snapshot; re-register app on persistent Ludwitt API) |

**Before opening PR:** deploy `execution/ludwitt-hult-api` to Render (`render.yaml` + `PERSIST_PATH`), run `npm run register-app`, sync Vercel env, drive 25+ users via `/launch?token=…`, then `npm run export-metrics`.

## Ludwitt/Hult app ID

`2478f105-9a57-446e-8793-bd301adf51c6`

## Investor touch log (redact PII)

Two sanitized entries in `INVESTOR_LOG.md` — regional climate-finance representative and Caribbean accelerator advisor engagements on Caribbean audit capability build-out.

## Agent usage

- Research: Prior submission fork workflow, Ludwitt JWT launch, public Caribbean tariff sources (T&TEC, BLPC, JPS, SKELEC, GPL, GlobalPetrolPrices)
- Dev: `cealgreen-energy-auditor` Next.js app — calculator engine, tariff compare, lighting/equipment/monitor modules, five venture events, Vitest
- QA: Unit tests, typecheck, build; smoke-test script for launch → calculator_completed → metrics

## Test plan

- [ ] Production URL works
- [ ] Authentication is required
- [ ] Valid authentication succeeds
- [ ] Invalid authentication fails closed
- [ ] Calculator completes successfully
- [ ] Results include assumptions and disclaimer
- [ ] Events reach the accepted metrics source
- [ ] Metrics use opaque platform IDs
- [ ] At least 25 qualified external users are evidenced
- [ ] Cohort members, duplicates and test users are excluded
- [ ] No PII appears in public evidence
- [ ] Investor deck is sanitized
- [ ] Business plan is sanitized
- [ ] Investor-touch log is redacted
- [ ] Private source repository is not exposed
