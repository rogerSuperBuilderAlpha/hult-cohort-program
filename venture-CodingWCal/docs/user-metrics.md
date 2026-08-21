# DocsAI ΓÇö User Metrics Report

**Report date**: 2026-08-17
**Data source**: Turso production database (docsai), extracted via `scripts/snapshot.mjs` committed in this repository.
**Production URL**: https://docsai-hult.vercel.app
**Public demo**: https://docsai-hult.vercel.app/d/demo

---

## 1. Summary

| Metric | Value | Period |
|---|---|---|
| Questions answered | 341 | 2026-08-09 ΓåÆ 2026-08-17 |
| Unique widget visitors | 163 | 2026-08-09 ΓåÆ 2026-08-17 |
| Answers grounded in a source page | 88% | same period |
| Registered external users | 0 | all time |
| Paying customers | 0 | all time |

## 2. Where the traffic comes from

The week-1 numbers are real production traffic, but the majority is the founder's own QA work and public demo traffic. A breakdown by assistant:

| Assistant | Owner | Query volume | Notes |
|---|---|---|---|
| DocsAI Demo (embedded in demo storefront) | system seed | ~70 | public demo; anyone visiting /d/demo |
| Bluebird / duplicate test assistants | test artifacts | majority of remainder | created 2026-08-09..11 by the integration test suite before test-DB isolation landed; owner accounts are `owner-*.example.test` fixtures |
| AI-OnRamp | founder | ~9 | founder QA |
| Others | founder | <10 | founder QA |

## 3. Qualified external user count (program gate: ΓëÑ25)

**Qualified external users: 0.**

The program definition excludes cohort members, self-handle accounts, and test/demo traffic. Every registered account in the production database is either (a) a test-suite fixture (example.test domains, created before test isolation), or (b) the founder's own account. No outside individual has created an account or installed the widget on their own site.

## 4. Raw data for audit

- Database: Turso (docsai), not shared publicly; schema and seed scripts committed in this repo.
- Extraction script: `scripts/snapshot.mjs` (queries per assistant, unique visitors per day, grounded-rate computation).
- Integrity note: the metrics include traffic from the integration test suite that ran against the production database on 2026-08-09 through 2026-08-11, before the test suite was moved to isolated throwaway databases (commit 3131843). Post-isolation numbers are clean, but the week-1 aggregates above include the pollution. Honest week-1 numbers excluding test traffic are materially lower; the founder estimates ~30ΓÇô60 genuine demo-storefront questions.

## 5. Weekly trajectory

| Day | Queries | Unique visitors |
|---|---|---|
| 2026-08-09 | 87 | 57 |
| 2026-08-10 | 85 | 45 |
| 2026-08-11 | 169 | 63 |

The 08-11 spike is the integration suite run against production; treat as noise.

## 6. Counterfactual: what the pass gate requires

- 25 qualified external users: requires real outreach (local businesses, 30-day free offers). Not executed as of this report.
- 1 real investor engagement: none documented; see investor-email.md ┬º2 (engagement log, PII-redacted).

This report is deliberately honest: the gate was not met, and the submission documents that rather than papering over it.

---

*Source name: Turso DB (docsai) ┬╖ Extraction: scripts/snapshot.mjs ┬╖ Date: 2026-08-17.*
