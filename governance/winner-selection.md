# Winner selection

**Purpose:** Voting mechanics for all three Phase 1 contests. Must stay consistent with [the-loop.md](../curriculum/phase-1/the-loop.md) and [peer-review-system.md](../assessment/peer-review-system.md).

---

## Voting method

**Ranked choice — rank your top 3 builds.**

| Choice | Reasoning |
|--------|-----------|
| ~~Single vote~~ | Loses signal; ties too common at n=30 |
| ~~Approval voting~~ | Encourages vote-all, weak winner mandate |
| **Ranked choice (top 3)** | Forces judgment; instant runoff handles ties; mirrors "I prefer A but B is acceptable" |

Ballot UI (cohort platform `/vote/{project}`; Firestore `ballots` + `votes` collections):

```
Rank #1 (3 points in internal tally): merged PR ___
Rank #2 (2 points): merged PR ___
Rank #3 (1 point): merged PR ___

Cannot rank own submission PR.
Must rank builds you reviewed (honor system; spot-check against review log).
```

---

## Self-votes

**Own build cannot appear on ballot.** Students may rank builds they contributed to as developer/user (post-cutover platform PRs) but not their contest submission repo.

---

## Ballot privacy

| Aspect | Policy |
|--------|--------|
| Individual ballots | **Private** — visible to program staff only |
| Aggregate results | **Public** — posted in cohort comms after winner announced |
| Ranked reasons | **Optional** — students may post public "why I ranked X #1" (encouraged, not required) |

Reasoning: private ballots reduce retaliation; public aggregates preserve accountability.

---

## Rubric vs vote relationship

**Reviews inform; votes decide.**

- Peer reviews produce rubric scores (5 dimensions × 1–5) per [peer-review-system.md](../assessment/peer-review-system.md)
- Votes are **not rubric-weighted**
- Tie-break only: median rubric score breaks vote ties
- Staff may publish rubric leaderboard as reference; it does not override vote

---

## Eligibility to receive votes

Build must pass **eligible build checklist** in [the-loop.md](../curriculum/phase-1/the-loop.md):

- **Submission PR merged to `main`** before deadline, with production URL and checklist items in PR body
- Deployed, public repo, README, AGENTS.md, smoke-test passes

Ineligible builds:
- Appear on review list (peers should still review for practice) but **excluded from ballots**
- Student may still pass cohort if they complete reviews; build unit marked incomplete

---

## Tie-break procedure

1. Instant runoff on ranked-choice ballots
2. If tied: higher **median total rubric score** (sum of 5 dimensions) across all peer reviews
3. If still tied: program director selects by production readiness (documented public note)

---

## Multiple wins

**One student may win multiple projects.** No restriction.

Implications documented in [the-loop.md](../curriculum/phase-1/the-loop.md): multi-platform operator load, team pick rules, unification collaboration.

---

## Vote administration

| Step | Owner | When |
|------|-------|------|
| Generate ballot (eligible merged PRs in Firestore) | Program director | Review week Thu |
| Distribute ballot link (`/vote/{project}`) | Program director | Review week Fri 10:00 |
| Remind non-voters | Program director | Review week Fri 14:00 |
| Close ballot | Auto | Review week Fri 16:00 |
| Run tally | Program director | Review week Fri 17:00 |
| Announce winner | Program director | Following Mon 10:00 |

Non-voters: counted as **failed participation** for that project unit (not full cohort fail unless pattern — see pass/fail).

---

## Open decisions

None.

## Depends on

- [curriculum/phase-1/the-loop.md](../curriculum/phase-1/the-loop.md)
- [assessment/peer-review-system.md](../assessment/peer-review-system.md)
- [operations/calendar.md](../operations/calendar.md)
