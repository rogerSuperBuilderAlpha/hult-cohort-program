# P2-L1 PR body — @ryanroper79-alt

## Summary

Shipped **cEAL Green Bid Manager** (Week 4 scope): Finder + Qualifier for DFI and Caribbean procurement. Public instance only — seeded with public tender records, no CEAL corporate data.

- **Finder** — source registry (Tier 1: IDB notices/plans, CCREEE, Caribbean Export, CDB, GCF, World Bank, UNGM, TED), relevance scoring, watchlist for procurement plans, source health display
- **Qualifier** — hard gates + weighted dimensions as pure functions (`src/lib/bidmanager/qualify.ts`) with Vitest; bid/no-bid memo, override capture
- **Extraction + gap report** — rule-based requirement extraction (`human_verified=false` until UI confirms), ranked gap report per opportunity
- **Ludwitt** — JWT launch (`/launch`), session cookie `bidmanager_session`, primary event `qualification.scored`

Assembler (compliance pack, section drafts) is Week 5+ and requires a verified corporate data pack.

## Ludwitt/Hult app ID

`b65605fa-d31d-4fdd-a993-295464c4baf5`

## Production listing URL

**https://ryanroper79-alt.vercel.app**

Launch URL: **https://ryanroper79-alt.vercel.app/launch**

Program directory (cohort): `https://site-nine-rouge-68.vercel.app/program/phase-2-learning-app`

## Promotion channels used

**TBD** — @ryanroper79-alt to fill before merge (Slack cohort channel, LinkedIn, etc.)

## Metrics API snapshot date

**TBD** — pick a date after production deploy and events are landing

## Integration evidence (launch flow + events firing)

### Launch flow

1. Platform issues JWT via `POST /v1/auth/launch-token` (app_id `b65605fa-d31d-4fdd-a993-295464c4baf5`)
2. User redirected to `https://ryanroper79-alt.vercel.app/launch?token=…`
3. Token validated; session cookie `bidmanager_session` set
4. Redirect to dashboard

### Non-heartbeat event (primary)

**Event:** `qualification.scored` (maps to Ludwitt `quiz_submitted`)

**When:** User runs Qualifier on an opportunity (`POST /api/opportunities/{id}/qualify`)

**Payload (metadata):**

```json
{
  "opportunity_id": "<uuid>",
  "total_score": "<0-100>",
  "recommendation": "bid|no_bid|partner_only",
  "funder": "<funder>",
  "value_usd": "<number>"
}
```

**Evidence template** (fill with live timestamps from smoke test or production):

```
Session: <session_id>
User: <external-user-id>
Timestamp: <ISO-8601>
Event: qualification.scored
Ludwitt API response: 201 Created
```

Local smoke test: `npm run smoke-test` (requires local Ludwitt API + `.env.local`)

Secondary events: `bid.decided`, `opportunity.screened` (Finder poll), `opportunity.discovered`

## Agent usage

- Research: Ludwitt integration spec, Born Digital Bid Manager build plan, cohort PR template
- Dev: Next.js app, pure bidmanager engine, in-memory public store, verification queue, gap report UI
- QA: `npm test`, `npm run typecheck`, `npm run build`

## Test plan

- [ ] Open production `/launch?token=…` from platform launcher
- [ ] Open Finder → poll sources → open opportunity → run Qualifier
- [ ] Confirm `qualification.scored` in platform metrics (same session as launch)
- [ ] Open Verification queue → confirm one requirement (only path to `human_verified=true`)
- [ ] Review gap report on opportunity detail page
- [ ] Fresh clone: `npm install`, copy `.env.example`, `npm test`, `npm run build`
