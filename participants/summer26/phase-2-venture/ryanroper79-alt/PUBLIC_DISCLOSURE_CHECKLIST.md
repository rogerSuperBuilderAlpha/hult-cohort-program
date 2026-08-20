# Public disclosure checklist — P2 Venture @ryanroper79-alt

Review before opening PR to `projects/summer26/phase-2-venture`.

| File / path | Public? | Confidential CEAL check |
|-------------|---------|-------------------------|
| `README.md` | Yes | OK |
| `docs/business-plan.md` | Yes | OK — no internal pricing; roadmap high-level only |
| `docs/marketing-investment-plan.md` | Yes | OK — **no named CRM accounts**; scenarios labeled preliminary |
| `docs/elevator-pitch.md` | Yes | OK — generic narrative |
| `docs/market-research.md` | Yes | OK — public census/tariff sources only |
| `docs/pitch-deck.md` | Yes | OK |
| `INVESTOR_LOG.md` | Yes | OK — generic categories, no PII |
| `evidence/metrics-snapshot-*.json` | Yes | OK — Ludwitt export only |
| `app/venture/**` | Yes | OK — renders sanitized markdown only |
| App source | Yes | OK — generic calculator; **not** proprietary Greenularity engines |
| `.env.local` | **No** | Never commit |

## Explicitly excluded from public repo (per privacy rules)

- Source PDFs with 100-account named CRM list
- Proprietary Greenularity engine weights/thresholds
- Confidential CEAL client data, pipelines, detailed financial models
- Authentication secrets

## Scans

- [x] Venture docs contain no named prospects from internal CRM PDF
- [ ] Metrics snapshot generated via `npm run export-metrics` (≥25 qualified users)
- [ ] No PII in evidence JSON

## In-app links

Production: https://caribbeanenergyauditor.vercel.app/venture
