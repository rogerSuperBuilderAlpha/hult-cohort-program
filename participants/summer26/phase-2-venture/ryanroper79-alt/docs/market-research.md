# Market research — Caribbean electricity & efficiency (public sources)

**Sanitized for Hult cohort submission · August 2026**

All figures below cite **public sources** or are labeled **preliminary management assumptions** for investor planning. They are not CEAL Green confidential forecasts.

---

## 1. Research question

Is there sufficient demand across five Caribbean jurisdictions for a digital tool that converts electricity bills into actionable, financeable efficiency pathways — and can a production MVP attract ≥25 verified external users through the Ludwitt/Hult platform?

---

## 2. Geographic scope

| Market | Role in sequence | Public rationale |
|--------|------------------|------------------|
| **Trinidad & Tobago** | Market 1 — prove MVP | CEAL Green home market; T&TEC published tiered tariffs ([T&TEC tariffs](https://ttec.co.tt/tariffs-2/)) |
| **Barbados** | Market 2 — portability | High visible energy charges + fuel adjustment ([BLPC tariffs](https://www.blpc.com.bb/residential/residential-tariffs-riders/)) |
| **Jamaica** | Market 3 — scale | Largest household base in initial set; JPS tools ([JPS Billie calculator](https://mybillie.online/JPSBillCalculator)) |
| **Guyana** | Market 4 — growth | Rapid household formation (Guyana 2022 census — see §3) |
| **St Kitts & Nevis** | Market 5 — Eastern Caribbean model | SKELEC tariff schedule + public calculator culture ([SKELEC](https://www.skelec.kn/electricity-tariff/)) |

---

## 3. Population & dwelling proxies (public census / official stats)

| Jurisdiction | Household / dwelling proxy | Source note |
|--------------|------------------------------|-------------|
| Trinidad & Tobago | ~401,000 private households (2011 census, latest widely cited) | T&T CSO / census publications |
| Jamaica | ~927,000 dwellings (census round) | STATIN / census summaries |
| Barbados | ~74,000 dwellings | Barbados census / CARICOM stats |
| Guyana | ~272,000 households (2022 census) | Bureau of Statistics Guyana |
| St Kitts & Nevis | ~22,000 dwellings | Eastern Caribbean census round |

*Use updated official tables before fundraising; numbers here support **directional** SAM sizing only.*

---

## 4. Electricity price context (public)

Illustrative retail benchmarks (verify at source before decisions):

| Jurisdiction | Indicative residential benchmark | Public reference |
|--------------|----------------------------------|------------------|
| Trinidad & Tobago | ~USD 0.06/kWh aggregate | [GlobalPetrolPrices T&T](https://www.globalpetrolprices.com/Trinidad-and-Tobago/electricity_prices/) · T&TEC tiers |
| Jamaica | ~USD 0.29/kWh aggregate | [GlobalPetrolPrices JM](https://www.globalpetrolprices.com/Jamaica/electricity_prices/) |
| Barbados | ~USD 0.33/kWh aggregate | [GlobalPetrolPrices BB](https://www.globalpetrolprices.com/Barbados/electricity_prices/) · BLPC |
| Guyana | Tiered GPL schedule | [GPL rates](https://gplinc.com/bill/rates-and-tariffs/) |
| St Kitts | SKELEC schedule | [SKELEC tariff](https://www.skelec.kn/electricity-tariff/) |

**Research insight:** Tariff dispersion across jurisdictions supports bill-comparison features; tiered billing supports “enter your kWh” over inferred rates.

---

## 5. Structural drivers (public policy literature)

- **IDB** and **CDB** publications describe Caribbean energy affordability, efficiency, and renewable-energy transitions as development priorities (cite IDB/CDB public reports in investor conversations — not reproduced verbatim here).
- **MSMEs** represent a large share of Caribbean employment — energy cost is a competitiveness issue, not only an environmental one (CDB public MSME materials).

---

## 6. Customer segments (MVP cohort mix)

Target first external user cohort (per venture brief):

| Segment | Target share | Discovery channel |
|---------|--------------|-------------------|
| Residential (higher consumption) | ~10 users | Social, community partners, utility-adjacent referrals |
| SMEs (restaurants, retail, offices) | ~10 users | Chambers, direct outreach |
| Higher-consumption commercial | ~5 users | Facilities / operations contacts |

**Anti-gaming:** Users must enter via Ludwitt/Hult launcher; cohort handles and test accounts excluded from metrics.

---

## 7. Competitive landscape (generic)

| Alternative | Limitation |
|-------------|------------|
| Utility online bill calculators | Tariff math only — no audit readiness or implementation path |
| Spreadsheet / consultant one-offs | Not scalable; no ongoing M&V |
| Generic North American audit tools | Poor Caribbean tariff and equipment fit |
| Manual energy auditors | Higher cost; longer lead time |

**Differentiation (public demo):** Caribbean tariff references + audit-readiness gate + CEAL Green professional pathway + Ludwitt-verified user evidence.

---

## 8. TAM / SAM / SOM — preliminary SaaS layer only

*Management scenario — **not** a forecast. Implementation revenue excluded.*

Assumptions (illustrative):

- Residential digital subscription: ~USD 60/year
- SME subscription: ~USD 600/year average
- SAM: higher-consumption, digitally reachable accounts (~30% residential / ~40% commercial proxy)
- SOM Year-3: penetration varies by launch sequence and CEAL field capacity

Directional five-market SaaS opportunity (software layer only): **~USD 55M SAM / ~USD 2M SOM ARR** order of magnitude — replace with verified utility-account data before investor deck finalization.

---

## 9. MVP validation metrics (Hult pass gate)

| Metric | Source | Target |
|--------|--------|--------|
| Verified external users | Ludwitt/Hult reference API export | ≥ 25 (target 30+ buffer) |
| Qualifying event | `calculator_completed` | Per platform opaque user ID |
| Investor touch | `INVESTOR_LOG.md` (redacted) | ≥ 1 qualified engagement |
| Evidence | `evidence/metrics-snapshot-*.json` | Date-stamped; no PII |

---

## 10. Research methods used

- Public utility tariff pages and bill calculators (listed in pitch deck)
- GlobalPetrolPrices aggregate benchmarks (Dec 2025 snapshots)
- Census / official statistics for dwelling counts
- Customer discovery interviews (summarized generically in investor log — no PII in public repo)
- Production app instrumented events (Ludwitt/Hult reference API)

---

## 11. Key risks

| Risk | Mitigation |
|------|------------|
| Tariff changes | Date-stamp sources; link to official pages |
| Over-promising savings | Ranges + disclaimers; professional audit for investment decisions |
| Low trust in digital tools | CEAL Green engineering validation pathway |
| Metrics gaming | Platform launcher + blocklist rules |
