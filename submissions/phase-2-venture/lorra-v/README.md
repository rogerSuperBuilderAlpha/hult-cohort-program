## Summary
The Effective Facilitator — a developmental learning venture teaching nine judgment disciplines (adapted from Jenkins & Jenkins) for the AI era. Live production app with a working Ludwitt integration (carried over from Week 4, now hardened with a public self-serve entry flow). This week: real user acquisition, an investor deck, a business plan, and documented investor engagement.

## Investor deck
[`investor/TEF_-_Investor_Deck.pdf`](./investor/TEF_-_Investor_Deck.pdf)

## Business plan
[`investor/TEF_Business_Plan.pdf`](./investor/TEF_Business_Plan.pdf)

Accompanying three-year financial model: [`investor/TEF_Three_Year_Financial_Model.xlsx`](./investor/TEF_Three_Year_Financial_Model.xlsx)

## App URL + user metrics
**Production app:** https://tef-deploy.vercel.app
**Metrics source:** own instance of the Ludwitt/Hult reference API (Railway), same instance used for Week 4's evidence — https://ludwitt-hult-api-production.up.railway.app, app_id d548f419-afc3-47c7-822e-c04e489a93cc
**Snapshot file:** [`investor/metrics-snapshot-2026-08-17.json`](./investor/metrics-snapshot-2026-08-17.json) — raw `GET /v1/apps/{app_id}/metrics` response from 2026-08-17 (`qualified_users: 12`). **Real confirmed qualifying users: 8**, verified row-by-row against `progress` / `profile_results`. Separately, **1 profile-only** engaged user completed the assessment but fired no Ludwitt qualifying event. Full breakdown: [`investor/user-verification.md`](./investor/user-verification.md).

## Investor touch log
One qualified investor touchpoint (direct outreach + pitch review). Structured entry: [`INVESTOR_LOG.md`](./INVESTOR_LOG.md).

## Customer discovery feedback
Two additional practitioners completed the product and provided written feedback (not investor engagement):

> "My profile scores definitely captured how I feel about using AI to support clearly defined organisational objectives." — Faculty, regional business school (usefulness 4/5, would continue using it)

> "Yes. I sent it around, asking others to complete it as well." — HR consultant

> "What a brilliant course; so well designed and accessible. I completely enjoyed it and learned so much from that module... The module makes clear distinctions about the value of the human element in understanding a problem through observation, lived experience and curiosity... AI generations are largely permutations of existing data and not necessarily real innovation. Beautifully written generative outcomes do not mean it's a correct solution." — Tracy Farrag, Business Development Representative, Media & Editorial Projects Ltd (rated the module 5/5)

> "I think the course is critical for everyone who uses AI because it addresses the inherent dangers if we don't understand our purpose in assigning a task to AI..." — on why the full programme is worth paying for

Tracy has since referred two additional contacts for review: an author who has written on AI and the enduring value of human judgment, and a senior lecturer at UWI (University of the West Indies).

## Test plan
- [x] Investor deck committed in repo
- [x] Business plan committed in repo
- [ ] ≥25 qualified external users, date-stamped snapshot
- [x] At least one documented investor engagement (PII redacted)
