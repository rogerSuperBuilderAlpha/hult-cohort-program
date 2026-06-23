# PM platform: operator handbook

**Purpose:** Obligations, rights, and SLAs for the Project 1 winner operating the cohort's live PM system from week 3 through week 8 (pilot end).

---

## Role summary

You won the vote. Your repo is now `pm-platform`. ~30 people depend on it daily. You triage PRs, ship fixes, and keep deadlines visible — while also building comms, showcase, and Phase 2 projects. This is the workload premium of winning.

---

## Responsibilities

| Area | Obligation |
|------|------------|
| **Uptime** | ≥ 99% business hours (8am–8pm cohort TZ) |
| **PR triage** | First response ≤ 24 hrs; merge decision ≤ 72 hrs |
| **Releases** | ≥ 1 user-visible release every 2 weeks with release notes |
| **User support** | Acknowledge blocking bugs ≤ 4 hrs |
| **Roadmap** | Public roadmap issue pinned; accepts feature requests from cohort |
| **Data** | No unannounced data wipes; migration plan if schema changes |
| **Seeding** | Week 5 kickoff: all projects/milestones from calendar loaded |

### Metrics tracked ([metrics.md](../../../assessment/metrics.md))

- Uptime (weekly)
- Median PR response time
- Monthly user satisfaction pulse (1–5)
- Release count

Violations trigger warning → improvement window → possible removal ([removal-succession.md](../../../governance/removal-succession.md)).

---

## Rights

| Right | Scope |
|-------|-------|
| **Merge/reject PRs** | Yes — operator is final merge authority on `pm-platform` |
| **Prioritize roadmap** | Yes — may defer feature requests |
| **Reject bad PRs** | Yes — with written reason; rejections reviewable by program director if disputed |
| **Rewrite subsystems** | Yes — with announcement + migration plan; ≥ 48 hr notice for breaking changes |
| **Feature-gate / charge** | **No** — free for all cohort members always |
| **Remove users** | Only for abuse; program director approval required |

---

## Integration obligations (weeks 7–8)

Must expose for showcase + comms unification ([ecosystem-unification.md](../ecosystem-unification.md)):

| Integration | Minimum |
|-------------|---------|
| **Public project API or embed** | Read-only view of cohort project status for showcase |
| **Shared user identity** | Same email/user ID comms and showcase can reference (SSO not required — shared email match acceptable) |
| **Deep links** | Task URLs linkable from comms messages |

Operator attends **3 unification syncs** (Tue week 8 × 3, 30 min each) with comms + showcase operators.

---

## Team

Operator selects **3 team members** (10% of 30) at week 8 draft ([team-formation.md](../../../governance/team-formation.md)). Team may:
- Triage PRs
- Ship fixes
- On-call rotation with operator

Operator remains accountable for SLAs.

---

## Handoff and succession

| Scenario | Procedure |
|----------|-----------|
| **Voluntary step-down** | 7-day notice → team elects interim → program director confirms → runner-up offered operator role if willing |
| **Removal** | See [removal-succession.md](../../../governance/removal-succession.md) |
| **Cutover failure (48 hr)** | Runner-up operates until original completes or removed |
| **End of semester** | Operator may archive or maintain; alumni read access preserved |

---

## Assessment

| Outcome | Effect |
|---------|--------|
| SLAs met ≥ 80% of weeks | Operator credential issued ([credentials.md](../../../governance/credentials.md)) |
| SLAs met 50–79% | Credential issued with note |
| SLAs < 50% or removed | Winner credential only (won vote); operator credential withheld |

Operating while completing Phase 2 is expected — not an excuse for SLA miss, but factored in dispute resolution.

---

## Open decisions

None.

## Depends on

- [../ecosystem-unification.md](../ecosystem-unification.md)
- [../../../governance/team-formation.md](../../../governance/team-formation.md)
- [../../../governance/removal-succession.md](../../../governance/removal-succession.md)
- [../../../governance/credentials.md](../../../governance/credentials.md)
- [../../../assessment/metrics.md](../../../assessment/metrics.md)
