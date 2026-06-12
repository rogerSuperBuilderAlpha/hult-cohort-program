# Work plan

**Status:** ✅ Design complete · 🚀 Execution artifacts added

Program docs (Tiers 1–7) are expanded. Launch artifacts live in [execution/](execution/).

---

## Execution phase (current)

| Artifact | Path | Owner |
|----------|------|-------|
| Cohort 1 launch checklist | [execution/checklists/cohort-1-launch.md](execution/checklists/cohort-1-launch.md) | Program director |
| Program Agreement draft | [execution/templates/legal/program-agreement.md](execution/templates/legal/program-agreement.md) | General Counsel |
| Admissions take-home repo | [execution/admissions-take-home/](execution/admissions-take-home/) | Founder — publish via `scripts/publish-public-repo.sh` |
| Cohort GitHub template | [execution/templates/cohort-project-template/](execution/templates/cohort-project-template/) | Program director |
| Ludwitt/Hult API (**runnable MVP**) | [execution/ludwitt-hult-api/](execution/ludwitt-hult-api/) | Founder — deploy by Nov 1 |
| Landing page (**Next.js site**) | [execution/marketing/site/](execution/marketing/site/) | Marketing + GC → Vercel |
| Application form | [execution/admissions/](execution/admissions/) + [FIREBASE.md](execution/marketing/FIREBASE.md) | Founder |
| Email templates | [execution/templates/emails.md](execution/templates/emails.md) | Program director |
| Discord bootstrap | [execution/operations/discord-bootstrap.md](execution/operations/discord-bootstrap.md) | Program director |
| Cohort scripts | [execution/cohort-scripts/](execution/cohort-scripts/) | Program director |

---

## Completed by tier

| Tier | Scope | Status |
|------|-------|--------|
| **1** | policy-review, guarantee, hiring-partners, admissions, calendar, financial-model | ✅ |
| **2** | onboarding (3), the-loop, winner-selection, cohort-tooling, cohort-lifecycle | ✅ |
| **3** | project-1-pm-platform (4), metrics, peer-review-system | ✅ |
| **4** | project-2-comms (4), project-3-showcase (4), ecosystem-unification, team-formation, removal-succession, credentials | ✅ |
| **5** | ludwitt-hult-platform, phase-2 all projects (12 files) | ✅ |
| **6** | showcase-event, pass-fail, job-offer-readiness, placement-referrals, repeat-enrollment | ✅ |
| **7** | subsidies, pricing, staffing, legal-risk | ✅ |

---

## ⚠️ DECISION NEEDED — by owner

### EVP

| Decision | Source | Recommendation |
|----------|--------|----------------|
| Program concept approval | PROPOSAL.md | Approve |
| Cohort 1 start: Sep 8, 2026 | operations/calendar.md | Confirm |
| Hiring partner pipeline owner | partnerships/hiring-partners.md | Name by Jun 2026 |
| Hult student $2,500 tuition discount | operations/admissions.md, business/pricing.md | Optional |
| Revenue split 70/30 tuition, 85/15 referral | business/financial-model.md | Approve |
| Reserve funding $245k | business/financial-model.md | Approve |
| Week 16 hybrid showcase (Boston anchor) | partnerships/showcase-event.md | Approve |
| Subsidy start cohort 2 | business/subsidies.md | Approve |
| Housing/food pilot | business/subsidies.md | Defer post $2M margin |
| Buyout ceiling $7,500 | business/guarantee-refunds-buyouts.md | Approve |
| Hardship tooling grant cohort 1 | curriculum/onboarding/tooling-setup.md | Case-by-case only |

### General Counsel

| Decision | Source |
|----------|--------|
| Refund schedule (week-1 full; none after) | institutional/policy-review.md |
| Program Agreement + guarantee marketing | business/guarantee-refunds-buyouts.md |
| Release and Separation (buyout) | business/guarantee-refunds-buyouts.md |
| Partner referral agreement template | partnerships/hiring-partners.md |
| Repeat enrollment visa rules | institutional/policy-review.md |
| Platform API ToS entity | partnerships/ludwitt-hult-platform.md |

### Finance

| Decision | Source |
|----------|--------|
| Billing entity for referral fees | institutional/policy-review.md |
| Payment at week 1 start | business/guarantee-refunds-buyouts.md |
| Insurance before cohort 1 | institutional/legal-risk.md |
| Installment payment option | business/pricing.md |
| International kickback tax | institutional/legal-risk.md |

### Founder

| Decision | Source |
|----------|--------|
| Ludwitt/Hult platform MVP by Nov 1, 2026 | partnerships/ludwitt-hult-platform.md |
| Admissions take-home repo | operations/admissions.md |
| First-10-partners warm outreach | partnerships/hiring-partners.md |
| $80k offer floor by market | business/guarantee-refunds-buyouts.md |

### Academic Affairs

| Decision | Source |
|----------|--------|
| Cohort Graduate certificate design | governance/credentials.md |

---

## Canonical locked decisions (do not contradict)

| Topic | Value |
|-------|-------|
| Cohort size | Target 30; min 20; max 40 |
| Tuition | $10,000 one-time |
| Tooling | $400/mo both tools required |
| Refund | 100% week 1; re-enroll after |
| Retake | Free, unlimited |
| Buyout | $5,000 default |
| Qualifying offer | FT SWE ≥ $80k; 180 days |
| Referral fee | 25%; 90-day clawback; 10% kickback |
| Voting | Ranked choice top 3 |
| Phase 2 users | ≥ 25 external per app snapshot |
| Open source | ≥ 1 merged PR; repo ≥ 1k stars |
| Bootstrap | Discord weeks 1–4 only |
| Team draft | Serpentine; 3 picks × 3 operators |

---

## Suggested next actions (execution, not docs)

1. EVP decisions on start date + reserve + partner owner
2. General Counsel Program Agreement + landing page guarantee language
3. Publish admissions take-home (`./scripts/publish-public-repo.sh`) — starter verified via `npm run test:ci`
4. Deploy Ludwitt/Hult API sandbox + marketing site staging (Vercel)
5. Wire Firebase credentials → `/api/applications` + Vercel env (see execution/marketing/FIREBASE.md)
6. Open applications Jun 15, 2026
