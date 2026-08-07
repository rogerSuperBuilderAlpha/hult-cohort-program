# Cohort scripts

Utilities referenced in program docs.

## review-assignments.js

Generates round-robin peer review assignments ([peer-review-system.md](../../assessment/peer-review-system.md)).

```bash
node review-assignments.js roster.example.json
```

Output: JSON with `primary_deep_reviews` (3) and `all_reviews` (n-1) per student.

Use real roster from admissions spreadsheet export before each review week.

## vote-tally.js (deprecated)

**Legacy ranked-choice instant runoff** from ballot CSV. The live platform uses private 👍/👎 in Firestore — use the site tally script instead:

```bash
cd execution/marketing/site
node scripts/tally-votes.mjs --project=phase-1-project-1
node scripts/tally-votes.mjs --all --json
```

The old CSV script is kept for historical exports only:

```bash
node vote-tally.js ballots.example.csv
```

## github-metrics-export.js

Pull review completion counts from cohort org (requires `GITHUB_TOKEN`):

```bash
GITHUB_TOKEN=ghp_... node github-metrics-export.js hult-cohort-fall26-boston
```

## seed-demo-cohort.mjs

Seed demo students into Firestore for UI testing (roster + applications + submissions).

Run from `execution/marketing/site`:

```bash
node scripts/seed-demo-cohort.mjs --count=45
node scripts/seed-peer-reviews.mjs          # demo written reviews + votes
node scripts/backfill-roster-submissions.mjs   # existing real roster members
node scripts/tally-votes.mjs --all          # staff thumbs-up tally
node scripts/seed-demo-cohort.mjs --dry-run    # preview only
```

Demo handles use prefix `demo-` and email `@demo.hult-cohort.test`. Marked with `demoSeed: true` for later cleanup.
