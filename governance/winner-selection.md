# Winner selection

**Purpose:** Voting mechanics for all three Phase 1 contests. Must stay consistent with [the-loop.md](../curriculum/phase-1/the-loop.md), [peer-review-system.md](../assessment/peer-review-system.md), and the cohort platform (`execution/marketing/site/content/program.ts`).

---

## Voting method (canonical — implemented)

**Private 👍/👎 per peer after a written GitHub review.**

| Step | Action |
|------|--------|
| 1 | File written review (GitHub issue `Review by @{you}`) on each eligible peer repo |
| 2 | Save issue URL on cohort platform → unlocks vote for that peer |
| 3 | Cast private 👍 or 👎 on platform (`peerRatings` in Firestore) |
| 4 | Winner = repo with **most thumbs up** after review week closes |

Platform routes: `/program/{slug}` progress panel + `POST /api/program/{slug}/ratings`.

**Not used:** ranked-choice top-3 ballots, `/vote/{project}`, or Firestore `votes`/`ballots` collections (legacy docs retired).

---

## Self-votes

**Cannot review or vote on own submission.** Enforced in UI and API.

---

## Ballot privacy

| Aspect | Policy |
|--------|--------|
| Individual votes | **Private** — each voter sees only their own 👍/👎 |
| Live tallies | **Never shown** during review week |
| Aggregate results | **Staff-only** until winner announced (`tallyThumbsUp` server helper) |
| Written reviews | **Public** on peer GitHub repos |

---

## Rubric vs vote relationship

**Reviews inform; votes decide.**

- Written reviews use 5-dimension rubric ([peer-review-system.md](../assessment/peer-review-system.md))
- Votes are **not rubric-weighted**
- Tie-break: higher **median total rubric score** across written reviews
- Staff may publish rubric leaderboard as reference; it does not override vote

---

## Eligibility to receive votes

A peer appears in your review/vote list only when **both**:

1. Active on cohort roster (`roster/{cohort}/members/{handle}`)
2. **Submission PR merged** before deadline (`submissions/.../entries/{handle}`)

Pass-gate denominator = **count of eligible peers**, not roster size − 1. If peers have not merged yet, your required count shrinks accordingly.

Ineligible (unmerged) builds: excluded from vote list; student may still pass if they complete reviews/votes on all **eligible** peers.

Primary ingestion: GitHub webhook → `POST /api/github/webhook`. Backstop: `scripts/reconcile-submissions.mjs`.

---

## Tie-break procedure

1. Most thumbs up wins
2. If tied: higher **median total rubric score** (sum of 5 dimensions) across peer written reviews
3. If still tied: program director selects by production readiness (documented public note)

---

## Multiple wins

One student may win more than one Phase 1 project. Operator obligations stack per [credentials.md](credentials.md).

---

## Staff tally

After review week closes, staff run thumbs-up tally from Firestore:

```bash
# Uses lib/ratings-server.ts tallyThumbsUp via staff script or Console export
```

Publish winner + aggregate thumbs-up count in cohort comms. Do not publish individual ballots (there are none — only per-voter maps).
