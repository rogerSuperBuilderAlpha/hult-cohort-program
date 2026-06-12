# Team formation

**Purpose:** Mechanics for winners drafting 10% of the cohort each after Phase 1. Cohort of 30 → **12 students in leadership roles** (3 winners + 9 picks).

---

## Draft mechanics

**Serpentine draft** by platform seniority (order avoids PM winner picking everyone):

| Pick order | Platform | Picks |
|------------|----------|-------|
| 1 | PM operator | 1st pick |
| 2 | Comms operator | 1st pick |
| 3 | Showcase operator | 1st pick |
| 4 | Showcase operator | 2nd pick |
| 5 | Comms operator | 2nd pick |
| 6 | PM operator | 2nd pick |
| 7 | PM operator | 3rd pick |
| 8 | Comms operator | 3rd pick |
| 9 | Showcase operator | 3rd pick |

Each operator picks **3 students** (10% of 30 = 3).

### Rules

| Rule | Detail |
|------|--------|
| **Eligibility** | Any student who passed Project 1–3 reviews (does not need to have won) |
| **Self-pick** | Operator cannot pick themselves |
| **Duplicate picks** | Same student may be picked by **max 2 operators** (cap prevents one person on all teams) |
| **Decline** | Student may decline 1 pick without penalty; operator must pick again |
| **Timeout** | 5 min per pick; operator forfeits pick to next if absent (program director runs clock) |

---

## Timing (week 8)

| When | Event |
|------|-------|
| Fri Nov 7, 17:30 | Unified ecosystem demo passes |
| Fri Nov 7, 18:00 | **Draft ceremony** (live, 30 min, streamed in comms) |
| Fri Nov 7, 19:00 | Teams announced; `#team-pm`, `#team-comms`, `#team-showcase` channels created |
| Mon Nov 10 | Teams begin operating under operator SLAs |

If unification demo fails: draft moves to Mon Nov 10 10:00.

---

## Team member roles

| Role | Expectations |
|------|--------------|
| **Operator (winner)** | Accountable for SLAs; merge authority; roadmap |
| **Team member (pick)** | ≥ 5 hrs/week on platform: PR triage, bug fixes, docs, on-call rotation |
| **Non-team student** | Unchanged developer/user obligations ([github-workflow.md](../curriculum/onboarding/github-workflow.md)) |

Team members receive **Leadership Team** credential ([credentials.md](credentials.md)). Operators receive **Operator** credential if SLAs met.

---

## Non-team students

- Full PR and issue rights on all platform repos
- No reduction in Phase 2 obligations
- May be added mid-semester (see below)

---

## Mid-semester additions

| Scenario | Policy |
|----------|--------|
| Team member steps down | Operator may pick replacement from cohort (1 per term, no draft ceremony) |
| Operator removed | Successor inherits team or re-picks ([removal-succession.md](removal-succession.md)) |
| Standout contributor | Operator may add **1 bonus member** with program director approval |

---

## Rounding rule

| Cohort size | Picks per operator |
|-------------|-------------------|
| 20–34 | 3 each (10% rounded to nearest integer, min 2, max 4) |
| 35–39 | 4 each |
| 40 | 4 each |

Formula: `max(2, min(4, round(cohort_size * 0.10)))`

---

## Ceremony script (abbreviated)

1. Program director explains serpentine order
2. Operators pick in order; picks posted live to showcase profiles
3. Conflicts (duplicate cap) resolved immediately — later pick chooses again
4. All students confirm acceptance in comms by EOD

---

## Open decisions

None.

## Depends on

- [removal-succession.md](removal-succession.md)
- [credentials.md](credentials.md)
- [../curriculum/phase-1/ecosystem-unification.md](../curriculum/phase-1/ecosystem-unification.md)
- [../operations/calendar.md](../operations/calendar.md)
