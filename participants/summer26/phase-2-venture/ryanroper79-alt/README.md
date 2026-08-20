# Greenularity Caribbean™ — Energy Auditor (Hult P2 Venture)

Public venture demonstration: authenticated calculator + sanitized business, marketing, research, and investor materials.

## Production URL

**https://caribbeanenergyauditor.vercel.app**

- Launch: **https://caribbeanenergyauditor.vercel.app/launch**
- Venture materials: **https://caribbeanenergyauditor.vercel.app/venture**

## Venture documents (repo)

| Document | Path |
|----------|------|
| Business plan | `docs/business-plan.md` |
| Marketing & investment plan | `docs/marketing-investment-plan.md` |
| Elevator pitch | `docs/elevator-pitch.md` |
| Market research | `docs/market-research.md` |
| Investor deck | `docs/pitch-deck.md` |
| Investor touch log | `INVESTOR_LOG.md` |

## Quick start

```bash
cd participants/summer26/phase-2-venture/ryanroper79-alt
cp .env.example .env.local
npm install
npm test
npm run dev
```

Ludwitt API (separate terminal): `cd execution/ludwitt-hult-api && npm run dev`

**Pass gate (≥25 users):** [USER_ACQUISITION_CHECKLIST.md](./USER_ACQUISITION_CHECKLIST.md) — Ludwitt env fix + launch links + snapshot export.

```bash
npm run register-app
npm run smoke-test
npm run export-metrics
```

## Architecture

| Path | Purpose |
|------|---------|
| `src/lib/energy/` | Generic calculator, tariffs, lighting, equipment, monitor (pure functions + Vitest) |
| `src/lib/ludwitt/` | JWT launch, session cookie, venture events |
| `app/calculator/` | Auth-gated calculator UI |
| `evidence/` | Date-stamped Ludwitt metrics snapshots (sanitized) |
| `docs/` | Public investor deck and business plan |

## Ludwitt events

| Venture event | Platform event |
|---------------|----------------|
| `authenticated_session_started` | `lesson_started` |
| `calculator_started` | `lesson_started` |
| `calculator_completed` | `quiz_submitted` (qualifying) |
| `results_viewed` | `lesson_completed` |
| `audit_information_requested` | `quiz_submitted` |

## Deployment

Separate Vercel project from the Week 4 Bid Manager (`ryanroper79-alt.vercel.app`). Set root directory to this folder and configure env vars from `.env.example`.

## Public submission artifacts

- `docs/pitch-deck.md`
- `docs/business-plan.md`
- `INVESTOR_LOG.md`
- `evidence/metrics-snapshot-*.json`
- `PUBLIC_DISCLOSURE_CHECKLIST.md`
