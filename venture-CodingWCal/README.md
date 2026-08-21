# DocsAI — Phase 2 venture package (@CodingWCal)

**DocsAI: AI customer-service widget for local businesses.** Paste a website URL, drop a script tag, and visitors get accurate, source-linked answers from the owner's own content. No API keys, no setup marathon.

| | |
|---|---|
| Live product | https://docsai-hult.vercel.app |
| Public demo | https://docsai-hult.vercel.app/d/demo |
| Repo | https://github.com/CodingWCal/docs-ai |
| Health | https://docsai-hult.vercel.app/api/health |

## The package

| Artifact | Path |
|---|---|
| README (this file) | — |
| Business plan | `docs/business-plan.md` |
| One-pager | `docs/one-pager.md` |
| Pitch deck (print-to-PDF, 16:9) | `docs/pitch-deck.html` |
| Market research | `docs/market-research.md` |
| Investor outreach + engagement log | `docs/investor-email.md` |
| User metrics report (date-stamped) | `docs/user-metrics.md` |
| Investor touch log | [`INVESTOR_LOG.md`](INVESTOR_LOG.md) |
| PRD + backlog | https://github.com/CodingWCal/docs-ai (`PRD.md`) |

## Gate status (honest)

- **≥25 qualified external users: NOT MET — 0 to date.** Every registered account is the founder's own or a test fixture (pre-isolation suite ran against prod 08-09→08-11; post-isolation counts are clean). Real but non-qualifying demo traffic: 341 questions / 163 unique visitors / 88% grounded (Aug 9–17). Details and raw-data note in `docs/user-metrics.md`.
- **≥1 qualified investor engagement: NOT MET — 0 to date.** Outreach draft exists (`docs/investor-email.md`); send deferred pending owner sign-off. Log has no invented entries.
- **Product:** done and QA-clean — 30/30 integration tests, CI, lint + typecheck, rate limiting (30/min, 20/day) with isolated test DBs.

## Test plan

- [ ] Open https://docsai-hult.vercel.app and the demo storefront `/d/demo`
- [ ] Ask the demo widget a question ("are you open? hours? pricing?") and confirm the answer cites a source
- [ ] Confirm `/api/health` returns `{"ok":true}`
- [ ] Confirm PR title and base branch `projects/summer26/phase-2-venture`