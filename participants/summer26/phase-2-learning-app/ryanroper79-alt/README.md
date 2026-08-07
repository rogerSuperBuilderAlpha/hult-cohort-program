# cEAL Green Bid Manager — Week 4 (Finder + Qualifier)

Born Digital Roadmap Phase 4.2 — ships Ludwitt pass gate (JWT + `qualification.scored` event). Assembler follows week 5+ once corporate data pack is verified.

## Quick start

```bash
cd participants/summer26/phase-2-learning-app/ryanroper79-alt
cp .env.example .env.local
npm install
npm test          # Vitest — qualify + relevance engine
npm run dev
```

Ludwitt API (separate terminal): `cd execution/ludwitt-hult-api && npm run dev`

```bash
npm run register-app
npm run smoke-test
```

## Architecture

| Path | Purpose |
|------|---------|
| `src/lib/bidmanager/` | Pure functions — qualify, relevance (no React/DB) |
| `src/lib/ludwitt/events.ts` | All platform events |
| `src/lib/db/store.ts` | Public demo store (Supabase optional) |
| `supabase/migrations/` | Full §2 schema + RLS |
| `.cursor/rules/bid-manager.md` | Build rules — read first |

## Week 4 shipped

- **Finder** — IDB notices/plans, CCREEE, Caribbean Export, CDB, GCF registry + source health
- **Qualifier** — hard gates, weighted dimensions, bid/no-bid memo, override logging
- **Watchlist** — `stage=plan` pre-positioning records
- **Manual entry** — Tier 3 sources
- **Ludwitt** — JWT `/launch`, primary event `qualification.scored`

## Two deployments

- **Public** (this repo path) — Ludwitt-registered, public tender seeds only
- **CEAL private** — separate Vercel project + Supabase — real evidence pack

## Not week 4

Assembler, gap report export, Tier 2 scrapers, ClickUp — week 5+
