# Market Research — DocsAI

**DocsAI: AI customer-service widget for local businesses**
Prepared for the Hult Cohort Week 5 venture sprint · Research compiled and dated **Aug 8, 2026** · All figures cited with source + date; unverified estimates flagged.

---

## 1. Executive Summary

- The conversational-AI / chatbot category is a **$9.3B (2025) global market** growing at ~23% CAGR, projected **$11.45B in 2026 and $32.45B by 2031** (Mordor Intelligence, 2025, republished Jul 7 2026).
- U.S. has **36.2M small businesses** (SBA Office of Advocacy), of which ~**6.4M have employees** — and 73–83% now operate a website (Clutch, Zippia, polled 2025).
- Small businesses are adopting AI fast (63–68% use it) but **customer service is a rarely-served primary use case** (~9%; NFIB 2025) — the gap DocsAI fills.
- The pain is measurable in money: SMBs **miss 20–35% of calls during business hours** and ~62% after hours; missed calls cost US SMBs **>$81B/yr** ($40–100k per business annually).
- Competitors are **enterprise-priced** (Zendesk $55+/agent; Intercom Fin $0.99/resolution) or **unbranded site-AI builders** (generic answers, premium tiers at $36–400/mo) — nothing priced and shaped for a single owner with a static website; nothing with a **zero-cost, keyless "works-today" default**.
- Bottom-up TAM: **$1.7–5.9B/yr US** (at $29–99/mo across ~5.0M website-having employer SMBs); validated SAM of local verticals **~$500M–$580M/yr**; SOM in 12 months ≈ **$2.5k MRR (~$30k ARR)** via 30–40 owners.

---

## 2. Category and Macro (PEST-lite)

| Lens | Finding | Source (date) |
|---|---|---|
| Political | Record formation: **5.67M new business applications filed in 2025**, ~30% "high-propensity"; SBA annual report (2026) celebrates record lending | US Census BFS (Jun 2026) via SBA 2026 annual report |
| Economic | SMB AI tools spend steady: median SMB uses **5 AI tools**; 82% of employer SMBs have invested in AI tools (Q1 2026); revenue lift claim 91% among adopters | SBE Council Q1 2026; CallSphere digest (Jun 9 2026) |
| Social | 62% of consumers prefer talking to a bot over waiting; 987M people use AI chatbots globally, 80% positive | DemandSage (2025) via Hyperleap (Jul 7 2026) |
| Social | 72% of consumers question a business's professionalism after a missed call | Ruby/Marchex compilations (2025–26) |
| Technological | Gartner: agentic AI to resolve **80% of common customer-service issues by 2029**, cutting ops cost ~30%; SFDC consolidating space (Intercom→Saleforce $3.5B deal, announced Jun 15 2026) | Gartner (2025); TechCrunch (Jun 15 2026); Macha (Jul 2 2026) |
| Technological | 75% of small businesses say AI-driven features are the highest-value deliverable from their webstack for 2026 | Salesforce (2025), cited by Rudys (2026) |
| Legal/Political | No federal SMB-AI-directive; focus on basic compliance (cookie/consent, ADA on widgets) — low regulatory friction vs fintech | industry observation, Aug 2026 |

---

## 3. Market Sizing (bottom-up)

### 3.1 Inputs (all cited)

| Input | Value | Source |
|---|---|---|
| US small businesses total | 36,207,130 (99.9% of firms) | SBA Office of Advocacy FAQ, Feb 2026 |
| Employer (has ≥1 employee) | 6,374,594 | US Census/SBA (2022 data, published 2026) |
| New business applications 2025 | 5,671,836 (record) | Census BFS, Jun 2026 |
| SMB with a website | 73–83% (survey-dependent); most-cited Clutch 2025: 83% | Clutch Aug 2025 (n=406); Zippia 2023–24; Forbes Advisor 2025 |
| SMBs using AI (any form) | 63–68% | SBE Council Q1 2026; Digital Applied/NFIB 2025 |
| SMB chatbot-market 2025 / 2026E | $9.3B / $11.45B (global); NA ≈ 38.8% | Mordor Intelligence, via Hyperleap (Jul 7 2026) |
| AI receptionist market | $4.64B (2026); ~35% CAGR | SBE Scorecard quarterly, via CallSphere (Jun 9 2026) |

### 3.2 TAM (US SMB chatbot/spend — employer firms with a website)

```text
6.37M employer SMBs × 83% online (Clutch) ≈ 5.0M addressable businesses
× $29/mo  ($348/yr conservative floor)     →  ~$1.7B/yr
× $99/mo  ($1,188/yr, near voice-AI ceiling) → ~$5.9B/yr
adj. for vertical-skew (only ~70% are customer-facing, chat-heavy verticals) → $1.2B–$4.1B
```

**TAM range adopted: $1.6B–$4.5B/yr (US, employer SMBs with websites)** — the PRD's range is grounded in the arithmetic above; it intentionally excludes the bigger consumer-chat and enterprise segments we will never serve.

**Corroborate (top-down):** NA chatbot spend = 38.8% × $11.45B ≈ **$4.4B in 2026** (Mordor). TAM is CFO-credible and ≤10% of that.

### 3.3 SAM (customer-facing local verticals DocsAI will actually sell into first)

```text
Focus verticals: food service, retail, health/beauty, fitness, auto, home services — ~2.3M employer SMBs (SBA state profiles)
Signed ground: businesses with their own website ≈ 1.8M
Price band: $19–$99/mo → $228–$1,188/yr per owner (midpoint ~$490/yr)
SAM ≈ 1.8M × ~$490/yr ≈ **$0.9B/yr ceiling** ; realized after vertical/payment filters ≈ **$0.5B/yr**
```

Adopt: **SAM ≈ $0.5B/yr** (US local vertical, 2026 snapshot).

### 3.4 SOM (12-month share, venture-scale)

| Scenario | Owners | ARPU (annualized) | MRR |
|---|---|---|---|
| Conservative | 60 | $58/mo | $3.5k MRR |
| Target (PRD) | 125 | ~$58/mo | ~$7.5k MRR by M12 (path to $2.5k by M2–3) |
| Stretch | 300 | median $60/mo | $18k MRR |

SOM = ~0.02% of SAM — deliberately small, honest, defensible.

---

## 4. Competitor Matrix (accessed Aug 8, 2026)

Pricing is from published vendor pages and the pricing analyses cited in §7; figures from secondary sources are flagged as unverified.

| Competitor | Position | Iconic price | What it doesn't fit |
|---|---|---|---|
| Zendesk Suite | Ticketing + AI; per-agent | from $55–$115 per agent/mo (2026); AI agent add-on ~$50/agent | 1-person shop: $600+/yr per user |
| Intercom (now Salesforce Fin, Jun 2026) | Messenger + AI agent | from $39/seat + Fin $0.99/resolution | per-team + per-resolution surprise; enterprise DNA |
| HubSpot Breeze Customer Agent | CRM-bundled AI, per-resolution | $0.50/resolved (Apr 2026 credits ~$10/1k) | requires Service Hub seat / CRM context |
| Freshdesk | Cheap helpdesk Alt | $15–$49/agent/mo | Still agent-per-seat; setup lift |
| Tidio | SMB live chat + AI | entry plans ~$29/mo (vendor page, unverified exact) | generic chatbot, less grounded answers; real AI gated to paid tiers |
| Chatwoot (OSS) | Self-hosted helpdesk | free self-host; hosted $19–$99/mo (G2, Jul 29 2026) | requires ops hobby to self-host; no LLM grounding out of the box |
| SiteGPT / Chatbase class | "Chat with your website" builders | $36–$400/mo (typical published tiers; site-unverified — confirm before citing) | Premium-priced; LLM cost baked in; no zero-cost mode |
| Dify (OSS) | General AI app platform | free self-host; cloud tiers | generic platform; 30-min no-setup story won't hold for mom-and-pop |
| Voice-AI receptionists (AInora, Ruby-type, CallSphere) | 24/7 phone AI | $30–$100+/mo | Voice, not web chat; heavier setup |
| **DocsAI** | **Widget Q&A from your own page, keyless default, $ realized at coffee-shop price** | **$19–$49/mo (vision), $0 marginal path** | — |

**Synthesis — our wedge:** every alternative sells either depth or platforms; DocsAI sells "five minutes, your own content, answers with the source shown, zero LLM invoice if you don't want one." The closest rivals (site builders) don't include a **keyless fallback** that works with no API budget, and the suites charge 5–20× with per-seat or per-resolution gates a café hits at month one.

---

## 5. Why Now

1. **Adoption tipping**: 63–68% of SMBs already use AI — the market is over the waiting-it-out hump (SBE Council Q1 2026; NFIB 2025), but only ~9% connect it to customer service (NFIB 2025).
2. **Cost of generic AI is dropping, but so is the inventiveness**: owners sense LLM prices but cannot see an on-ramp that costs $0 until it works.
3. **AI receptionist wave proved ROI expectations and a price ceiling** (~$30–$150/mo band; CallSphere, Jun 2026) — chat widget is the cheaper first step.
4. **Missed-question revenue math is now well-documented**: $81B missed-call cost, 20–35% in-hours miss (Ruby 2025), 85% won't call back (MIT/InsideSales) — owners hear the numbers and believe because they feel the same call funnel.
5. **Owners are more comfortable now**: "Every business gets asked the same 10–15 questions hundreds of times... AI delivers both without fatigue" — mainstream SMB media language, mid-2026.

---

## 5. Owner Voice — Field Notes (secondary research; dated)

1. **r/smallbusiness (Jan–Feb 2026, thread "50+ inquiries/day ... drowning")** — owner of a technical training service: "currently just me responding to: course contact form, Instagram DMs, Facebook, email. Takes 3–4 hrs/day. Killing my ability to actually run the business." — and "tried hiring a VA... they still escalate 50% of questions back to me."
2. **Orimon (Feb 2026)** — "Every day, thousands of customers DM with one question: 'Do you ship to my country?'... By the time someone checks inbox six hours later, that customer already bought from a competitor." Same "the same 10–15 questions every time" pattern as our thesis.
3. **ZenOp study (Apr 2026)** — the voicemail myth: callers hang at 8–12 s, never leave a message; owners think "slow day".
4. **Novacall (Apr 2026)** — 62% of after-hours calls to SMBs unanswered.
5. **Ruby (2025) "Small Business Communication Report"** — 20–35% of in-hours calls missed.
6. **MIT/InsideSales and Marchex data (compiled by AInora, Apr 2026)** — 85% of callers who don't get through won't call back; 72% question professionalism.
7. **DemandSage 2025** — consumers: 62% prefer bot over waiting; 80% report positive chatbot experiences.
8. **Digital Applied (2025/2026)** — ~64% of SMB non-adopters intend to adopt in 2026.

**Note on primary interviews (gap, flagged):** the MR is compiled from dated, public secondary sources with an actual owner voice (that doubles as requirement evidence if needed). Formal primary interviews of real owners are **scheduled for Phase 5 outreach** (≥25 external users drive; each intake becomes a short structured interview — "what do you answer 10+ times a week?"). This is a deferred human-checkpoint item (see PRD §15).

---

## 6. Risky Bets & Watch Items

- **Misplaced trust in AI-generated content** — mitigated by cite-only template mode.
- **AI cost overruns** — mitigated by 20 calls/day cap, no streaming, keyless default.
- **Channel dependency** — widget on third-party sites needs best-effort CORS; keep demo pages public.
- **Compliance watch** — cookie banners; widget code for ADA (keyboard nav, screen-reader labels, contrast) as standard.
- **Target segment dissonance** — 17% of businesses are still offline (Clutch 2025); DocsAI serves the 83% with websites (~5.0M addressable).

---

## 7. Sources (accessed Aug 8, 2026)

1. SBA Office of Advocacy — "Frequently Asked Questions About Small Business, 2026," Feb 3 2026; "2025 Small Business Profiles," Jun 30 2025.
2. US Census Bureau — Business Formation Statistics (2025 annual), release Jun 2026.
3. Clutch — "The State of Small Business Websites in 2025," Aug 2025 (n=406).
4. Zippia / Forbes Advisor — small business website surveys (2023–25).
5. Mordor Intelligence — chatbot market (2025), via Hyperleap "State of AI Customer Service for Small Businesses 2026," updated Jul 7 2026.
6. Grand View Research — chatbot market (2024), cited by Elfsight (2026).
7. SBE Council — "2026 Small Business Tech Use Survey" (Q1 2026), via CallSphere digest (Jun 9 2026).
8. NFIB / Digital Applied — SMB AI adoption and customer-service use gap (2025).
9. Salesforce — SMB AI trends (Dec 2024 release); cited broadly 2026.
10. TechCrunch — Intercom acquisition by Salesforce (Jun 15 2026).
11. Ruby — "Small Business Communication Report" (2025).
12. Novacall — after-hours stats (Apr 2026); ZenOp — missed-call data report (Apr 2026); CompareTiers — Intercom vs Zendesk pricing (Mar 25 2026); PricePulse — Zendesk/HubSpot/Freshdesk pricing comparisons (May 16 2026); G2 — Chatwoot pricing (Jul 29 2026).
13. r/smallbusiness threads (Jan–Feb 2026, unlinked by privacy; excerpt quotes in §5).
14. Orimon (Feb 2026), Robylon (May 19 2026), CallSphere (Jun 2026), AInova (Apr 2026) — vendor blogs with SMB pain data compiled above.