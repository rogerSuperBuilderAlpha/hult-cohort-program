# DocsAI — One-Pager

**@codingwcal** · Hult Cohort Summer 2026 · Week 5 Startup Sprint · Live: https://docsai-hult.vercel.app

## What it is

DocsAI gives a café, salon, gym, or auto shop a customer-facing AI answer assistant in under five minutes: paste your website, drop one script tag, and visitors get accurate, source-linked answers to "are you open?", "do you do X?", "how much is Y?" — drawn from the owner's own pages, with the source link shown underneath. No API keys, no setup marathon.

## Why it matters

- SMBs miss 20–35% of calls during business hours; missed calls cost US small businesses >$81B/yr.
- 63–68% of US SMBs already use AI, but only ~9% use it for customer service — the gap DocsAI fills.
- Rivals are $55+/agent suites (Intercom Fin, Zendesk AI) or premium site-builders with LLM cost baked in; nothing works at a $0 keyless floor.

## Pricing (monthly, inclusive)

| Tier | Price | Included |
|---|---|---|
| Starter (honest) | $0 | 1 assistant, ≤3-page crawl, keyless template answers, 50 queries/mo |
| Coffee Shop | $19 | Unlimited sites ≤10 pages, bring-your-own-key LLM mode, no query cap |
| Main Street | $49 | 3 assistants, any-domain embed, visitor dashboard, 2 seats |
| Corner | $99 | 10 assistants, white-label, pro install + quarterly content review |

Free tier seeds the widget-embed loop and the ≥25 external-user gate; monetization starts at $19.

## Business model

- ARPU blended ~$58/mo; target $2.5k MRR / 100+ live assistants at 12 months.
- Gross margin 92–97% (hosting + fees only; $0 LLM on the keyless default path).
- Runway 12 mo solo; monthly expense ~$35 (Turso + Vercel). Break-even is a handful of paid owners.

## Traction (honest, date-stamped)

- Production app live since Aug 9: https://docsai-hult.vercel.app (public demo storefront: `/d/demo`).
- 341 questions answered, 163 unique widget visitors, 88% grounded (Aug 9–17; majority founder QA + public demo traffic).
- **Qualified external users: 0.** No outside owner has created an account or installed the widget on their own site.
- **Qualified investor engagements: 0.** Outreach draft ready (`docs/investor-email.md`); send deferred pending owner sign-off and user numbers.
- CI green: 30/30 integration tests, lint + typecheck clean, rate limiting + daily chat caps.

## The ask

30 minutes of feedback and a warm intro to 1–2 local business owners who fight the same 10–15 questions every day. No capital raised until 100 paying owners prove the pod.

Full docs (in this folder): `business-plan.md`, `market-research.md`, `pitch-deck.html`, `investor-email.md`, `user-metrics.md`.