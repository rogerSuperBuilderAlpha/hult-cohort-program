# PM platform: review rubric

**Purpose:** Project 1 scoring dimensions for peer reviews. Uses the standard 5-dimension format from [peer-review-system.md](../../../assessment/peer-review-system.md) with PM-specific guidance.

---

## Review artifact

Filed as GitHub Issue on reviewee's repo per [peer-review-system.md](../../../assessment/peer-review-system.md). Minimum 150 words; primary reviews (3 assigned) ≥ 300 words.

**Votes are separate** from rubric — ranked-choice ballot per [winner-selection.md](../../../governance/winner-selection.md). Rubric breaks vote ties only.

---

## Rubric dimensions (1–5 each)

### 1. Production readiness

| Score | Criteria |
|-------|----------|
| 1 | Deploy down or auth broken |
| 3 | Works for single user; flaky multi-user |
| 5 | Stable with 5+ reviewers simultaneously creating tasks |

**Test:** Sign up, create project, add 3 tasks, assign 2 to different users, change status.

### 2. Core functionality (PM baseline)

| Score | Criteria |
|-------|----------|
| 1 | Missing ≥ 2 baseline features |
| 3 | All baseline features work with rough edges |
| 5 | All baseline + ≥ 2 differentiating features polished |

### 3. Code quality

| Score | Criteria |
|-------|----------|
| 1 | Unreadable; no structure |
| 3 | Clear modules; some tests or types |
| 5 | Tested critical paths; documented data model; sensible abstractions |

**Repo exploration required:** Cite ≥ 3 files. Read the auth and task-creation paths at minimum.

### 4. Ecosystem thinking

| Score | Criteria |
|-------|----------|
| 1 | Built for solo use |
| 3 | Considers 30 users but UX untested |
| 5 | Obvious how cohort lives here 14 weeks: onboarding, notifications, operator handoff, PR-friendly architecture |

Ask: *Would I trust this for my real job's sprint board?*

### 5. UX / polish

| Score | Criteria |
|-------|----------|
| 1 | Confusing; can't find create task |
| 3 | Functional; peers can use with README |
| 5 | Fast, intuitive; would choose over Discord+sheet |

---

## Weights (advisory — for tie-break only)

| Dimension | Weight |
|-----------|--------|
| Production readiness | 25% |
| Core functionality | 25% |
| Ecosystem thinking | 20% |
| Code quality | 15% |
| UX / polish | 15% |

Weighted score used only for tie-break calculation, not vote weighting.

---

## Time budget

| Activity | Time |
|----------|------|
| Deploy smoke-test | 10 min |
| Repo exploration (with research agent) | 20 min |
| Write review | 15 min |
| **Total per review** | **~45 min** |
| **29 reviews** | **~22 hrs** (review week) |

Agents draft review comments; **human must edit and score**.

---

## Open decisions

None.

## Depends on

- [../../../assessment/peer-review-system.md](../../../assessment/peer-review-system.md)
- [../../../governance/winner-selection.md](../../../governance/winner-selection.md)
- [requirements.md](requirements.md)
