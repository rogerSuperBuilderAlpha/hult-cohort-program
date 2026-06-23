# Cohort lifecycle

**Purpose:** End-to-end stage map for running one cohort from recruitment through placement. Owners and timing for cohort 1 (**Summer Pilot 2026**).

Firestore cohort id: `fall26` (unchanged from initial launch configuration).

---

## Stage map

| Stage | Timing | Owner | Key outputs |
|-------|--------|-------|-------------|
| **Recruitment** | Jun 2026 | Founder + marketing | Landing page, applications |
| **Admissions** | Jun 15 – Jul 8 | Program director | 25–30 confirmed students |
| **Pre-cohort prep** | Jul 7–8 | Students + staff | Tooling verified, org invites sent |
| **Onboarding** | Week 1 (Jul 9–15) | Program director | Agents, GitHub, deploy test |
| **Phase 1** | Weeks 2–5 | Cohort (staff facilitates) | 3 live platforms, unified ecosystem, operators named |
| **Phase 2** | Week 6 | Cohort | Learning app, venture, open source PR |
| **Showcase** | Week 6 (Aug 19) | Placement lead | Partner review event |
| **Assessment** | Week 6 | Program director | Pass/fail determinations |
| **Placement** | Weeks 7–42 | Placement lead | Offers, referral fees, guarantee fulfillment |
| **Alumni** | Ongoing | Placement lead (light) | Emeritus org access, repeat enrollment option |

---

## Pre-cohort prep (Jul 7–8)

| Day | Action |
|-----|--------|
| Jul 7 | Admitted students confirm; Pre-Cohort Setup email sent |
| Jul 7 | GitHub org `hult-cohort-fall26-boston` created; template repo seeded |
| Jul 8 | Discord bootstrap server created; invites sent |
| Jul 8 | Staff verify roster ≥ 20; if not, 2-week delay decision |

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

## Placement phase (post-pilot)

| Milestone | Timing |
|-----------|--------|
| Pass determinations published | Aug 20, 2026 |
| Partner intro routing active | Aug 20 |
| 180-day guarantee clock starts | Pass date |
| First placement target | 90 days (Dec 2026) |
| Kickback payments | Net 30 after fee collection |
| Guarantee fulfillment audit | Monthly |

Self-sourced offers: student submits offer letter → placement lead verifies against [guarantee-refunds-buyouts.md](../business/guarantee-refunds-buyouts.md) criteria.

---

## Inter-cohort gap

| Carries forward | Does not carry forward |
|-----------------|------------------------|
| Student's $10k enrollment agreement | Live platforms |
| Alumni org read access | Discord bootstrap |
| Credentials / showcase archive | Legacy ballot data |
| Repeat enrollment rights | PM/comms/showcase operators |

Next cohort gets a **fresh org**, fresh bootstrap, fresh builds. Returners start from zero on platforms but keep their skills and GitHub history.

---

## Cohort cadence

| Phase | Cadence |
|-------|---------|
| Cohort 1 | Summer Pilot 2026 (6 weeks) |
| Cohort 2+ | **One new cohort per term per campus** (Fall + Spring when scaled) |
| Parallel cohorts | Allowed across campuses (Boston + London) — separate orgs |
| Repeat enrollees | Join any campus cohort with open seat |

Target by Fall 2027: 2 campuses × 30 students = 60 new + 10–15 returners per term.

---

## Cohort 1 staff week-by-week (summary)

| Weeks | Staff focus |
|-------|-------------|
| 1 | Onboarding, setup verification, bootstrap Discord |
| 2–5 | Kickoffs, review admin, vote tally, cutover support, unification demo |
| 6 | Ludwitt/Hult API monitoring, venture deck review, OSS verification, showcase event |
| 7 | Pass/fail, placement handoff |

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
