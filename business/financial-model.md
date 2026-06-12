# Financial model

**Purpose:** End-to-end numbers validating the program thesis: near-zero marginal cost per student, revenue concentrated in placement fees, larger cohorts are better, repeat enrollment is economically safe.

**Baseline assumptions:** Cohort size **30**, tuition **$10,000**, referral fee **25%** of first-year base, **70%** of passing students placed within 12 months, average placed salary **$180,000**.

---

## Per-cohort P&L (cohort of 30, first term)

### Revenue

| Line | Calculation | Amount |
|------|-------------|--------|
| Tuition | 30 × $10,000 | **$300,000** |
| Less: week-1 refunds (assume 5%) | 1.5 × $10,000 | **($15,000)** |
| **Net tuition** | | **$285,000** |
| Referral fees (lagged — see below) | 21 placed × $45,000 avg fee | **$945,000** |
| Less: student kickbacks (10%) | 21 × $4,500 | **($94,500)** |
| **Net referral revenue** | | **$850,500** |
| **Total cohort revenue (tuition + placement)** | | **$1,135,500** |

*Referral fee at $180k salary × 25% = $45,000. Placement revenue hits ~6–12 months after cohort start depending on time-to-hire.*

### Costs (cohort 1, first term)

| Line | Calculation | Amount |
|------|-------------|--------|
| Program director (0.5 FTE × 6 mo) | $90k/yr × 0.5 × 0.5 | **$22,500** |
| Placement lead (1 FTE × 6 mo) | $75k/yr × 0.5 | **$37,500** |
| Campus space (1 room × 6 mo) | $2k/mo × 6 | **$12,000** |
| Events (showcase, 1 cohort) | Flat | **$5,000** |
| Infra (GitHub org, domains, misc) | Flat | **$2,000** |
| Legal (program agreement, partner templates) | Amortized | **$10,000** |
| Marketing / admissions | Flat | **$15,000** |
| Buyout reserve draw (assume 1 buyout) | | **$5,000** |
| **Total cohort costs** | | **$109,000** |

### Cohort 1 margin (tuition year only)

| | Amount |
|---|--------|
| Net tuition | $285,000 |
| Less costs | ($109,000) |
| **Tuition-year margin** | **$176,000** |

Placement revenue ($850,500 net) arrives in months 6–18 — see cash flow below.

**Student tooling ($400/month) is student-paid and excluded from program P&L.**

---

## Placement revenue model

### Assumptions

| Variable | Cohort 1 | Cohort 2+ (mature) |
|----------|----------|-------------------|
| Cohort size | 30 | 30 |
| Pass rate | 80% (24 pass) | 85% |
| Placement rate (of pass) | 70% | 80% |
| Avg salary | $180,000 | $190,000 |
| Referral fee % | 25% | 25% |
| Partner-sourced (% of placements) | 50% | 65% |
| Self-sourced (% — no fee) | 50% | 35% |
| Avg time-to-offer (days from pass) | 90 | 60 |

### Placements per cohort (cohort 1)

```
30 students × 80% pass = 24 pass
24 × 70% placed = 16.8 → 17 placed (round)
17 × 50% partner-sourced = 8.5 → 9 fee-bearing placements
9 × $45,000 fee = $405,000 referral gross
Less kickback: $40,500
Net referral (cohort 1 conservative): $364,500
```

Use **$850,500** in headline P&L when mature (21 fees) — cohort 1 pipeline is cold; model both:

| Scenario | Fee-bearing placements | Net referral |
|----------|------------------------|--------------|
| Cohort 1 conservative | 9 | $364,500 |
| Cohort 1 target | 15 | $607,500 |
| Mature cohort | 21 | $850,500 |

---

## Repeat enrollee cost

| Cost type | Per repeat enrollee | Notes |
|-----------|---------------------|-------|
| Tuition | **$0** | Covered by original payment |
| Staff attention | **~$200** | Marginal: one more seat in existing sessions; placement lead adds ~2 hrs |
| Space | **$0** | Same room |
| Peer review load | **$0** | Absorbed by cohort — actually *helps* hit review minimums |
| Tooling | **$0 to program** | Student-paid |
| **Total program marginal cost** | **~$200** | |

**Reasoning:** Repeat enrollees are economically accretive in Phase 1 (more reviewers, more voters, richer ecosystem) and cheap in Phase 2. The guarantee is safe.

---

## Refund and buyout reserves

| Reserve | Size | Basis |
|---------|------|-------|
| Refund | **$150,000** | 50% of max cohort tuition (15 students exit week 1) |
| Buyout | **$50,000** | 10 × $5,000 |
| Clawback | **$45,000** | 1 kickback reversal at $45k fee |
| **Total recommended reserve (cohort 1)** | **$245,000** | |

Replenish from tuition margin each cohort.

---

## Break-even analysis

### Tuition-only break-even (ignoring placement)

```
Fixed cost per cohort: $109,000
Net tuition per student: $9,500 (after 5% refund assumption)
Break-even students: 109,000 / 9,500 = 11.5 → 12 students
```

**Tuition alone covers costs at 12 students.** Target of 30 is 2.5× break-even.

### Full break-even (tuition + placement, cohort 1 conservative)

```
Costs: $109,000
Tuition net: $285,000
Placement net (conservative): $364,500
Total revenue: $649,500
Margin: $540,500 per cohort (conservative)
```

Even cohort 1 conservative case is strongly profitable once placement lands.

### Worst case: zero placements

```
Tuition net: $285,000
Costs: $109,000
Margin: $176,000
```

Program survives a placement miss on cohort 1 tuition alone — but **cannot honor the job guarantee's spirit** without partners. Partner pipeline is the real risk, not bankruptcy.

---

## Cash flow timing (cohort 1)

| Month | Cash in | Cash out | Notes |
|-------|---------|----------|-------|
| M0 (Sep) | $285,000 tuition | $55,000 (partial staff) | Week 1 charge |
| M1–M5 | $0 | $54,000 | Staff + space |
| M6–M8 | $135,000 (3 fees @ $45k) | $13,500 kickbacks | First hires |
| M9–M12 | $270,000 (6 more fees) | $27,000 kickbacks | Remaining hires |
| **M0–M12 total** | **$690,000** | **$149,500** | **Net: $540,500** |

---

## 3-cohort projection (18 months)

| | Cohort 1 (Fall '26) | Cohort 2 (Spring '27) | Cohort 3 (Fall '27) |
|---|---------------------|------------------------|---------------------|
| New students | 30 | 30 | 30 |
| Repeat enrollees | 0 | 5 | 12 |
| Total seats | 30 | 35 | 42 |
| Tuition revenue (new only) | $285,000 | $285,000 | $285,000 |
| Placement net (conservative→target) | $364,500 | $500,000 | $700,000 |
| Costs | $109,000 | $115,000 | $125,000 |
| **Cohort margin** | **$540,500** | **$670,000** | **$860,000** |
| **Cumulative** | **$540,500** | **$1,210,500** | **$2,070,500** |

Costs scale slowly: +$6k/cohort for staff, +$10k at 40+ seats for second room.

### Subsidy affordability threshold

| Subsidy | Cost/cohort (30 students) | Affordable when |
|---------|---------------------------|-----------------|
| Tooling ($400/mo × 4 × 30) | $48,000 | Cumulative margin > $500k ✅ after cohort 1 |
| Tooling + 10 seats @ $2,500 tuition discount | $73,000 | After cohort 2 |
| Housing/food pilot (10 students × $3k) | $30,000 | After cohort 2, requires ⚠️ EVP approval |

Recommend: **subsidize tooling starting cohort 2** for students with demonstrated need (application flag). See [subsidies.md](subsidies.md).

---

## Staffing cost detail (feeds cohort P&L)

| Role | FTE (cohort 1) | Loaded cost | Notes |
|------|----------------|-------------|-------|
| Program director | 0.5 | $45,000/yr | Curriculum, disputes, partner oversight |
| Placement lead | 1.0 | $75,000/yr | Partner pipeline, intros, offer verification |
| Admissions (contract) | 0.25 | $15,000/cohort | Application review, take-home grading |
| **Total** | | **~$109,000/cohort** | See [operations/staffing.md](../operations/staffing.md) |

---

## Revenue split with Hult

⚠️ **DECISION NEEDED (EVP + Finance):** Revenue split between program entity and Hult central.

**Recommended model for negotiation:**

| Stream | Split | Reasoning |
|--------|-------|-----------|
| Tuition ($10k) | **70% program / 30% Hult** | Hult provides brand, campus, registrar, ISS |
| Referral fees | **85% program / 15% Hult** | Program generates partner relationships and placement labor |
| Kickback | 100% program-funded | Pass-through to student |

At mature cohort (tuition + placement net $1.135M): program retains ~$950k, Hult ~$185k before costs.

Alternative: Hult takes fixed fee per seat ($2,000) + 10% of referral. Model both in Finance review.

---

## Key metrics dashboard (track per cohort)

| Metric | Target |
|--------|--------|
| Cohort size (confirmed week 1) | ≥ 25 |
| Week-1 refund rate | ≤ 10% |
| Pass rate | ≥ 80% |
| Placement rate (180 days) | ≥ 70% |
| Partner-sourced placement % | ≥ 50% |
| Avg referral fee | ≥ $40,000 |
| Buyouts | ≤ 2 |
| Repeat enrollees next term | Track (healthy: 5–15%) |
| Tuition-year margin | ≥ $150,000 |

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Revenue split with Hult (70/30 tuition, 85/15 referral recommended) | EVP + Finance |
| Reserve funding source | EVP + Finance |
| Subsidy start cohort (recommend cohort 2 tooling) | Founder + EVP |
| Conservative vs. target placement assumptions for budgeting | Finance |

## Depends on

- [pricing.md](pricing.md)
- [guarantee-refunds-buyouts.md](guarantee-refunds-buyouts.md)
- [placement-referrals.md](placement-referrals.md)
- [operations/staffing.md](../operations/staffing.md)
- [operations/admissions.md](../operations/admissions.md)
- [institutional/policy-review.md](../institutional/policy-review.md)
- [partnerships/hiring-partners.md](../partnerships/hiring-partners.md)
