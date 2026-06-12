# Peer review and rating system

**Purpose:** Mechanical system for Phase 1 peer reviews — the program's most-repeated skill drill. Must align with [the-loop.md](../curriculum/phase-1/the-loop.md) and [winner-selection.md](../governance/winner-selection.md).

---

## Scale

| | Count |
|---|-------|
| Students per cohort | 30 |
| Reviews per student per project | 29 |
| Phase 1 projects | 3 |
| **Total reviews per student** | **87** |
| **Total reviews per cohort per project** | **870** |

Agents assist repo archaeology; **human writes the judgment.**

---

## Review artifact format

Filed as **GitHub Issue** on reviewee's repo: `Review by @{reviewer}`

```markdown
## Review by @reviewer-handle
**Deployment tested:** yes/no — URL: 
**Time spent:** ~X min

### Repo exploration (cite files)
- `path/to/file`: observation
- `path/to/file`: observation
- `path/to/file`: observation

### Rubric
| Dimension | Score (1-5) | Note |
|-----------|-------------|------|
| Production readiness | | |
| Core functionality | | |
| Code quality | | |
| Ecosystem thinking | | |
| UX / polish | | |
| **Total** | /25 | |

### One actionable suggestion
(specific, ≤ 2 hr implementation)

### Recommendation
merge-ready / needs-work / incoherent

### Agent usage
Which agent(s) assisted this review:
```

---

## Rubric dimensions (all Phase 1 projects)

| Dimension | 1 ( poor) | 5 (excellent) |
|-----------|-----------|---------------|
| **Production readiness** | Broken deploy | Stable, auth works, handles 30 users |
| **Core functionality** | Missing brief requirements | Exceeds brief |
| **Code quality** | Unreadable, no structure | Clear, tested, documented |
| **Ecosystem thinking** | Single-user toy | Designed for cohort living inside it |
| **UX / polish** | Confusing | Peers can use without asking author |

Project folders may add **1 project-specific dimension** replacing UX for weighting — see project rubrics in Tier 3.

---

## Review quality assessment

Reviews are themselves graded. **Low-quality reviews hurt the reviewer's pass.**

| Signal | Detection | Consequence |
|--------|-----------|-------------|
| < 150 words | Auto-flag script | Warning; must rewrite by +24 hrs |
| No file citations | Staff spot-check | Warning |
| Copy-paste same review | Diff tool across repos | Fail that project unit |
| ≥ 3 late reviews | Timestamp | Fail that project unit |
| Median review quality ≥ 4/5 by peer spot-checks | Optional 5% sample | Distinction note on showcase |

**Review quality spot-check:** Each student randomly assigned 2 reviews to rate (1–5) during retro week. Sample only.

---

## Review week logistics

| Day | Milestone |
|-----|-----------|
| Mon | Window opens; repo list published |
| Wed 14:00 | ≥ 10/29 reviews due |
| Fri 14:00 | 29/29 reviews due |
| Fri 16:00 | Votes due ([winner-selection.md](../governance/winner-selection.md)) |

### Round-robin deep-review assignments

Staff assigns 3 "primary" reviews per student (must exceed 300 words, full rubric). Other 26 may be slightly shorter (≥ 150 words) but must include rubric + citation.

Assignment matrix generated via script: `scripts/review-assignments.py` in org — no student reviews own repo.

---

## Human/agent split

| Task | Human | Agent |
|------|-------|-------|
| Clone and skim repo | ✓ | Assist map |
| Click deploy URL, test flows | ✓ | — |
| Read critical paths | ✓ | Research agent proposes paths |
| Write judgment | ✓ | QA agent drafts; human edits |
| Rubric scoring | ✓ | — |
| Submit issue | ✓ | — |

**Rule:** Reviews with "agent usage: none" on complex builds are suspect — staff may spot-check.

---

## Tie-break input

When votes tie, **median total rubric score** across all 29 reviews for each tied candidate breaks the tie. Computed by staff script exporting GitHub issue labels.

---

## Ongoing peer signals (post-cutover)

| Signal | Cadence | Format |
|--------|---------|--------|
| Platform PR reviews | Continuous | GitHub review |
| Operator responsiveness rating | Monthly | 1–5 form, optional comment |
| Team member peer rating | Week 8, week 16 | Anonymous 1–5: "Would you work with them again?" |

Ongoing signals feed [job-offer-readiness.md](job-offer-readiness.md), not pass/fail directly.

---

## Open decisions

None.

## Depends on

- [curriculum/phase-1/the-loop.md](../curriculum/phase-1/the-loop.md)
- [governance/winner-selection.md](../governance/winner-selection.md)
- [curriculum/onboarding/github-workflow.md](../curriculum/onboarding/github-workflow.md)
