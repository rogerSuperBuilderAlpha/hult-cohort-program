# Cohort lifecycle

**Purpose:** End-to-end stage map for running one cohort from recruitment through placement. Owners and timing for cohort 1 (Fall 2026).

---

## Stage map

| Stage | Timing | Owner | Key outputs |
|-------|--------|-------|-------------|
| **Recruitment** | Jun–Aug 2026 | Founder + marketing | Landing page, applications |
| **Admissions** | Jun 15 – Aug 29 | Program director | 25–30 confirmed students |
| **Pre-cohort prep** | Sep 1–7 | Students + staff | Tooling verified, org invites sent |
| **Onboarding** | Week 1 | Program director | Agents, GitHub, deploy test |
| **Phase 1** | Weeks 2–8 | Cohort (staff facilitates) | 3 live platforms, unified ecosystem, 12 leaders |
| **Phase 2** | Weeks 9–16 | Cohort | Apps, ventures, open source PRs |
| **Showcase** | Week 16 | Placement lead | Partner review event |
| **Assessment** | Week 16 | Program director | Pass/fail determinations |
| **Placement** | Weeks 17–52 | Placement lead | Offers, referral fees, guarantee fulfillment |
| **Alumni** | Ongoing | Placement lead (light) | Emeritus org access, repeat enrollment option |

---

## Pre-cohort prep (Sep 1–7)

| Day | Action |
|-----|--------|
| Sep 1 | Admitted students confirm; Pre-Cohort Setup email sent |
| Sep 3 | GitHub org `hult-cohort-fall26-boston` created; template repo seeded |
| Sep 5 | Discord bootstrap server created; invites sent |
| Sep 7 | Staff verify roster ≥ 20; if not, 2-week delay decision |

See [tooling-setup.md](../curriculum/onboarding/tooling-setup.md) for student checklist.

---

## GitHub org structure

```
Org: hult-cohort-{term}-{campus}
Teams:
  students        (write access to own repos + platform PRs)
  operators       (maintain on platform repos — added at cutover)
  staff           (admin — program director only)
  alumni          (read — post-placement)

Branch protection on pm-platform, comms-platform, showcase-platform:
  - Require PR review before merge (after week 4)
  - No direct push to main except operator emergency (documented)
```

Repo naming: [github-workflow.md](../curriculum/onboarding/github-workflow.md)

---

## Placement phase (weeks 17–52)

| Milestone | Timing |
|-----------|--------|
| Pass determinations published | Dec 20, 2026 |
| Partner intro routing active | Dec 20 |
| 180-day guarantee clock starts | Pass date |
| First placement target | 90 days (Mar 2027) |
| Kickback payments | Net 30 after fee collection |
| Guarantee fulfillment audit | Monthly |

Self-sourced offers: student submits offer letter → placement lead verifies against [guarantee-refunds-buyouts.md](../business/guarantee-refunds-buyouts.md) criteria.

---

## Inter-cohort gap

| Carries forward | Does not carry forward |
|-----------------|------------------------|
| Student's $10k enrollment agreement | Live platforms |
| Alumni org read access | Discord bootstrap |
| Credentials / showcase archive | Google Forms ballots |
| Repeat enrollment rights | PM/comms/showcase operators |

Next cohort gets a **fresh org**, fresh bootstrap, fresh builds. Returners start from zero on platforms but keep their skills and GitHub history.

---

## Cohort cadence

| Phase | Cadence |
|-------|---------|
| Cohort 1 | Fall 2026 only |
| Cohort 2+ | **One new cohort per semester per campus** (Fall + Spring) |
| Parallel cohorts | Allowed across campuses (Boston + London) — separate orgs |
| Repeat enrollees | Join any campus cohort with open seat |

Target by Fall 2027: 2 campuses × 30 students = 60 new + 10–15 returners.

---

## Cohort 1 staff week-by-week (summary)

| Weeks | Staff focus |
|-------|-------------|
| 1 | Onboarding, setup verification, bootstrap Discord |
| 2–8 | Kickoffs, review admin, vote tally, cutover support, dispute mediation |
| 9–15 | Light touch — market judges Phase 2; placement lead ramps partner intros |
| 16 | Showcase event, pass/fail, placement handoff |

Detail: [staffing.md](staffing.md) (Tier 7).

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Second campus for cohort 2 (London vs SF) | EVP |

## Depends on

- [admissions.md](admissions.md)
- [calendar.md](calendar.md)
- [cohort-tooling.md](cohort-tooling.md)
- [partnerships/hiring-partners.md](../partnerships/hiring-partners.md)
- [business/guarantee-refunds-buyouts.md](../business/guarantee-refunds-buyouts.md)
