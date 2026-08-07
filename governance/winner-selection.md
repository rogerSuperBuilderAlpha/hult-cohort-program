# Winner selection

**Purpose:** Voting mechanics for all three Phase 1 contests. Must stay consistent with [the-loop.md](../curriculum/phase-1/the-loop.md), [peer-review-system.md](../assessment/peer-review-system.md), and the cohort platform (`execution/marketing/site/content/program.ts`).

---

## Voting method (canonical — implemented)

**Public optional upvote on GitHub after a written review. No downvotes.**

| Step | Action |
|------|--------|
| 1 | File written review (GitHub issue `Review by @{you}: @{peer}`) on the **peer’s app/build repo** |
| 2 | Optionally keep `Vote: up` in that issue body to upvote — or delete that section to abstain |
| 3 | Platform discovers issues from GitHub (refresh progress); no paste-URL or platform 👍/👎 |
| 4 | Winner = submission with **most upvotes** after review week closes (staff CLI) |

Platform routes: `/program/{slug}` progress panel. Staff tally: `tallyThumbsUp` / `scripts/tally-votes.mjs`.

**Not used:** private Firestore ballots, ranked-choice top-3, `/vote/{project}`, or downvotes.

---

## Self-votes

**Cannot review or vote on own submission.** Enforced in discovery (self pairs ignored).

---

## Ballot visibility

| Aspect | Policy |
|--------|--------|
| Written reviews | **Public** on GitHub |
| Upvotes (`Vote: up`) | **Public** on GitHub |
| Live / final tallies on site | **Never shown** — browse cohort repos to count if desired |
| Aggregate results | **Staff CLI** until winner announced |

---

## Tie-break (staff)

Most upvotes wins. If tied: earliest submission `mergedAt`, then handle sort. Persistent ties: rubric median per staff judgment.

---

## Staff commands

```bash
cd execution/marketing/site
npx tsx scripts/tally-votes.ts --project=phase-1-project-1
npx tsx scripts/tally-votes.ts --all --json
npx tsx scripts/tally-votes.ts --project=phase-1-project-1 --publish --confirm
```
