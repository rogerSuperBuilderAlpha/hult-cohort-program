# Business Plan — DocsAI

**DocsAI: AI customer-service widget for local businesses** · Author: @codingwcal · Date: **Aug 8, 2026** · Companion: `market-research.md`, `pitch-deck.html`, `investor-email.md`

---

## 1. The Business in One Paragraph

DocsAI gives a café, salon, gym, or auto shop a customer-facing AI answer assistant in under five minutes: paste your website, drop a script tag, and visitors get accurate, source-linked answers to "are you open?", "do you do X?", "how much is Y?" — from the owner's own content. It works with **zero LLM API key** (BM25-lite template path, always-on, $0 marginal cost) and upgrades to grounded LLM answers when a key is added. Revenue = flat monthly subscription a sole owner can afford; cost structure = so thin that gross margin is the best in the table.

## 2. Vision & Mission

- **Vision:** Every local business on the web answers its top-10 questions without a hire, an API invoice, or a support suite.
- **Mission:** stand up a knowledgeable copy of your business in under five minutes and let DocsAI carry the "is it open?" funnel 24/7.
- **North star metric (12-mo):** $2.5k MRR and 100+ assistants live on owner sites (program-level: ≥25 verified external users on the metrics snapshot).

## 3. Market (summary — details in market-research.md, dated Aug 8 2026)

- **TAM:** $1.6B–$4.5B/yr (US SMB employer internet presence; bottom-up).
- **SAM:** ≈ $0.5B/yr (customer-facing local verticals first: food, retail, beauty/health, auto, home services).
- **SOM:** $2.5k MRR by M12 ≈ 125 owners × ~$58 avg, i.e. ~0.02% of SAM. Conservative 60-owner case lands $3.5k MRR.
- **Category tilt:** global chatbot spend $11.45B 2026E (+23% CAGR), NA ≈ 38.8% of it (Mordor/Jupiter, via Hyperleap Jul 7 2026).

## 4. Product & Price Tiers (inclusive)

| Tier | Price | What's included (all prices inclusive; USD billed monthly) |
|---|---|---|
| **Starter (honest) — $0** | Free forever | 1 assistant, 1 site crawl (≤3 pages), template answers (keyless), widget, 50 visitor queries/mo |
| **Coffee Shop** | **$19/mo** | 1 assistant, unlimited sites** (≤10 pages), both answer modes (bring-your-own key), no query cap, CSV export, priority support (email) |
| **Main Street** | **$49/mo** | Up to 3 assistants (site+FB page), embedding on any domain, visitor dashboard (top-20 questions), team seat (owner + manager) |
| **Corner (fallback/floors)** | **$99/mo** | 10 assistants, custom branding, removal of "Powered by DocsAI", pro install + content review (1hr/quarter) |

Annual billing runs at 2 months free (~−17%) — listed as annual-equivalent below when modeled. Free tier exists to seed the widget-embed loop and the external-user gate; monetization starts at $19.

**Revenue model mechanics:**
- ARPU modeled: blended $58/mo (mix: 45% Coffee + 40% Main Street + 15% Corner, ~0% paid-play at free).
- MRR = Σ(paid tiers AMT) — no usage-metering, no per-resolution, no surprise bills (explicit differentiators vs Intercom Fin/Zendesk AI; see competitor rows).
- Expansion: cross-sell from Starter→Coffee on first visitor-widget month; upsell Main Street when 2nd site or FB page appears; Corner for malls/aggregates.

## 5. Go-to-Market (first 12 months)

Channels (ranked by cost-per-signed-owner):

1. **Local SEO content**: "AI widget for cafés/salons" pages per vertical + sample demo (`/d/*` public pages) → owns the "automated hours-answer" query.
2. **SMB-owner networks**: Facebook groups (from research field notes), Reddit r/smallbusiness outreach, local chamber lists, owner meetups — each has "the same 10–15 questions" story.
3. **Friction-free install**: no card required for 14 days; install = paste snippet; value realized in the first visitor question. Demo first, pay once it works.
4. **Partner network (early breadcrumb)**: local web designers/Agencies get a white-label ~30% revenue share "DocsAI for my clients" — small step, do not build for it yet.

Funnel: 100 demo visits → 40 signups → 15 assistants created → 8 owners reveal chat value → 4 paid ($260/mo at $65 ACV). Elevate to 125 owners/mo target by outreach + long-tail content.

## 6. Financial Model (assumptions stated)

| Line | M12 target | Notes |
|---|---|---|
| Paying accounts | 70–100 | from ≥25 verified external owners (program gate) |
| ARPU (blended paid) | $57/mo | 50% Coffee, 35% Main, 15% Corner |
| MRR (target) | $4k–$5.7k | plan: $2.5k MRR worst case |
| ARR | ~$50k | |
| Gross margin | 92–97% | hosting+fees only; LLM cost only where keyless upgrades bought |
| CAC | $0 (organic/word-of-mouth); ≤$25 with paid ads | most signups come from demo + owner referrals |
| Runway | 12 mo (solo) | |

**Expense baseline (month):** ~$35 (Turso + Vercel) + $0 LLM (keyless default) + founder time. No hire in year one. COGS ≈ a few dollars — break-even requires only a handful of paid owners.

## 7. Team & Traction (as of today)

- **Founder (@codingwcal):** solo founder/solo developer for the cohort sprint; full stack TS/Next experience from prior program builds including a production learning app with event-instrumented reference API (W4).
- **Built so far:** PRD, market research, business plan, investor deck (today); app scaffold + engine, widget, dashboard, metrics (this week, see Milestones).
- **Program pass gate:** ≥25 verified external owners; source = our self-hosted Ludwitt reference instance; date-stamped snapshot committed to the repo (submission window opens Mon Aug 10 9am EDT).

## 8. Risks & Mitigation (top 5)

| Risk | Impact | Mitigation |
|---|---|---|
| Owners fear AI giving wrong answers | Trust fail | cite-only template default; source link always shown; per-assistant cap |
| Competitive AI-sa business builds (AI site builders dropping prices) | Velocity | zero-cost mode + vertical niche focus; pricing agility; channel lock-in via local SEO |
| LLM cost overrun if upgrade path grows | Margin | hard daily cap per assistant (20), max 400 tokens, no streaming |
| Very low paying conversion from free | Revenue | free tier caps at 50 visitor-Q/mo; "coffee" at $19 is cheap enough to convert the funnel |
| Widget CSS/CORS issues on odd sites | Adoption | best-effort CORS; public `/d/*` demo pages + pre-outreach smoke tests |

## 9. Milestones (from the PRD, §18)

| Phase | Scope | Done by |
|---|---|---|
| 1 | Research + venture packet | Aug 8–9 (today) |
| 2 | App scaffold + accounts | Aug 9–10 |
| 3 | Assistant engine + widget | Aug 10–11 |
| 4 | Events + snapshot | Aug 11–12 |
| 5 | Outreach: ≥25 external users + investor email | Aug 12–17 |
| 6 | Submission PR + merge | by program deadline (window opens Mon Aug 10 9am EDT) |

## 10. The Ask

No capital raised in MVP: we make revenue before we ask for money. We raise (pre-seed, $25k–$100k) only when 100 paying owners prove the pod. Today's **ask from an investor/collaborator is 30 minutes of feedback and warm intro to 1–2 local owners** — see `investor-email.md` for the working template.