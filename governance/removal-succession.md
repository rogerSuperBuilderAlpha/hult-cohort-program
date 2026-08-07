# Removal and succession

**Purpose:** Leadership is conditional. Defines triggers, due process, succession, and credential effects when operators or team members leave roles.

---

## Removal triggers

### Performance (operator)

| Trigger | Threshold |
|---------|-----------|
| Uptime miss | < 95% for 2 consecutive weeks |
| PR triage miss | Median response > 48 hrs for 2 consecutive weeks |
| Release miss | 0 releases in 3 weeks |
| User satisfaction | Avg < 2.5 for 2 consecutive monthly pulses |
| Unification failure | Failed demo + 48 hr fix window missed |

### Conduct (operator or team member)

| Trigger | Action |
|---------|--------|
| Harassment, discrimination | **Immediate** removal — program director |
| Platform sabotage | **Immediate** removal |
| Abuse of merge authority (targeted blocking) | Investigation → removal if confirmed |
| Team dysfunction (3+ team complaints) | Warning → 1 week improvement → removal vote |

---

## Who decides

| Situation | Decision body |
|-----------|---------------|
| Performance removal | Program director (data-driven from [metrics.md](../assessment/metrics.md)) |
| Conduct removal | Program director + 1 staff witness |
| Disputed removal | **Peer petition:** ≥ 10 students sign → program director review within 48 hr |
| Operator disputes team member | Operator removes team member with director notification (no petition required) |

Students do not vote to remove operators directly — petition triggers review, not auto-removal.

---

## Due process

### Performance path

```
Week N: SLA miss flagged automatically
Week N+1: Written warning + improvement plan (specific metrics)
Week N+2: Still missing → 7-day notice of removal
Week N+3: Removal effective; succession begins
```

### Conduct path (serious)

```
Incident documented → same-day removal → succession within 48 hr
No improvement window for harassment/sabotage
```

---

## Succession

| Role | Successor order |
|------|-----------------|
| **PM operator** | 1) Volunteer from PM team → 2) Runner-up by vote count → 3) Program director appoints interim from leadership pool |
| **Comms operator** | Same pattern |
| **Showcase operator** | Same pattern |
| **Team member** | Operator picks replacement ([team-formation.md](team-formation.md)) |

Runner-up = highest ranked-choice points among eligible builds from original vote (excluding removed operator's self if they won).

Interim operator has **2 weeks** to confirm or step down; permanent if SLAs met.

---

## Voluntary step-down

| Step | Detail |
|------|--------|
| Notice | 7 days written to program director + team |
| Assessment | **No penalty** — noted positively if handoff clean |
| Handoff | Documentation issue + 2 sync sessions with successor |
| Credential | **Winner** credential retained; **Operator** credential reflects weeks served |

Stepping down well is a leadership skill — not punished.

---

## Credential effects

| Outcome | Winner credential | Operator credential | Leadership Team |
|---------|-------------------|---------------------|-----------------|
| Completed term, SLAs met | ✅ | ✅ | ✅ (team) |
| Removed for performance | ✅ (won vote) | ❌ | ❌ if removed |
| Removed for conduct | ✅ | ❌ | ❌ |
| Voluntary step-down, clean handoff | ✅ | Partial (weeks served badge) | ✅ if completed ≥ 50% term |
| Voluntary step-down, messy | ✅ | ❌ | Case by case |

Distinction: **Winner** = won the vote (permanent). **Operator** = served successfully (conditional).

---

## Open decisions

None.

## Depends on

- [team-formation.md](team-formation.md)
- [credentials.md](credentials.md)
- [../assessment/metrics.md](../assessment/metrics.md)
- [../curriculum/phase-1/project-1-pm-platform/operator-handbook.md](../curriculum/phase-1/project-1-pm-platform/operator-handbook.md)
