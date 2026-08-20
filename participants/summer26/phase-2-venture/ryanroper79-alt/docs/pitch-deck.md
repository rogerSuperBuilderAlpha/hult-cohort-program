# Sanitized investor deck — Greenularity Caribbean™

**Public demonstration · preliminary assumptions labeled throughout**

**Related:** [elevator-pitch.md](./elevator-pitch.md) · [marketing-investment-plan.md](./marketing-investment-plan.md) · [market-research.md](./market-research.md)

---

## 1. Problem — rising Caribbean electricity costs

Commercial and institutional buildings across the Caribbean face volatile electricity tariffs, aging equipment, and limited visibility into end-use consumption. Property owners often lack a structured first step before committing to capital retrofits or professional audits.

*Public context: regional utilities publish tariff schedules (e.g. T&TEC, BLPC, JPS, SKELEC, GPL) and third-party aggregators such as GlobalPetrolPrices compile comparative retail benchmarks.*

---

## 2. Target users

| Segment | Need |
|---------|------|
| **Residential** | Understand bills, compare jurisdictions, prioritise low-cost measures |
| **Commercial** | Screen sites for audit readiness, build internal business cases |
| **Institutional** | Preliminary benchmarking before formal procurement of audit services |

Initial geographic focus: Trinidad & Tobago, Barbados, Jamaica, St Kitts & Nevis, Guyana.

---

## 3. Solution — generic calculator & audit readiness

**Greenularity Caribbean™ Energy Auditor** (public demo) provides:

- Auth-gated preliminary consumption and spend estimates
- Illustrative low / medium / high savings **ranges**
- Audit Readiness Score (transparent generic rules — not proprietary Greenularity scoring)
- Caribbean jurisdiction bill comparison using **published tariff references**
- Lighting retrofit and equipment advisors (illustrative capital and payback ranges)
- Simulated usage monitor for budget targeting (demo — not live IoT)

**Not provided:** investment-grade audits, guaranteed savings, or proprietary CEAL audit procedures.

---

## 4. User journey

1. Launch from Ludwitt/Hult (authenticated)
2. Enter spend, optional kWh, floor area, loads, efficiency measures
3. Review results, tariff comparison, and recommended actions
4. Optional: lighting / equipment modules and audit information request
5. Professional audit pathway for customers requiring verified engineering work

---

## 5. Demonstration screenshots

See `docs/screenshots/` (generic UI captures — no client data).

Production: https://caribbeanenergyauditor.vercel.app

---

## 6. Market opportunity (public sources only)

- Caribbean electricity prices vary significantly by jurisdiction; GlobalPetrolPrices (Dec 2025 snapshots) shows residential benchmarks ranging from approximately **USD 0.06/kWh (T&T)** to **USD 0.33/kWh (Barbados)** for published aggregates — verify at utility sources before decisions.
- Utility tariff pages (T&TEC, BLPC, JPS, SKELEC, GPL) indicate tiered residential and commercial structures driving bill complexity.
- Energy-efficiency and audit services are commonly procured after preliminary screening — this tool addresses the **first-mile** education and qualification step.

*All market sizing herein is directional; not a confidential CEAL forecast.*

---

## 7. Revenue model (high level)

| Stage | Offering |
|-------|----------|
| Free | Preliminary calculator & audit-readiness (this demo) |
| Paid | Professional energy audit (site visit, measurement) |
| Project | Engineering recommendations & implementation support |
| Optional | Monitoring and reporting (customer-controlled) |

Internal CEAL pricing and margins are **not** published in this deck.

---

## 8. Go-to-market (generic)

- Utility and facility-manager outreach in target jurisdictions
- Partnerships with regional accelerators and climate-finance programmes
- Ludwitt/Hult cohort launch channel for authenticated early adopters
- Content citing public tariff calculators (JPS Billie, BLPC bill estimator, etc.)

---

## 9. Verified user traction

Metrics sourced from Ludwitt/Hult reference API — see `evidence/metrics-snapshot-*.json`.

- Qualification: authenticated opaque user ID + `calculator_completed` event
- Excludes cohort participants, duplicates, and platform blocklisted test accounts

*Count populated at snapshot export — not manually typed.*

---

## 10. Pilot / partnership ask

Seeking pilot partners to:

- Validate audit-readiness workflow with real facilities (sanitized public case studies only)
- Co-develop Caribbean tariff reference maintenance using official utility publications
- Explore climate-finance pathways for audit subsidies in the region

**Preliminary assumption:** professional audits target **≥15%** building bill savings when actionable measures are implemented — requires site verification; not guaranteed by the calculator.

---

## Sources cited (public)

- https://ttec.co.tt/tariffs-2/
- https://mybillie.online/JPSBillCalculator
- https://www.globalpetrolprices.com/Jamaica/electricity_prices/
- https://www.skelec.kn/electricity-tariff/
- https://www.globalpetrolprices.com/Saint-Kitts-and-Nevis/electricity_prices/
- https://www.blpc.com.bb/estimating-your-bill/
- https://www.blpc.com.bb/residential/residential-tariffs-riders/
- https://592hub.com/tools/electricity-calculator?type=residential
- https://gplinc.com/bill/rates-and-tariffs/
