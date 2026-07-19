# Pulse scale / load harness

Simulates a cohort of N synthetic members driving realistic board activity, then measures the
cost of the read paths that grow with the cohort. **Emulator-only** — it refuses to run unless
`FIRESTORE_EMULATOR_HOST` is set, and all data uses synthetic `zz-test-*` ids torn down each run.
It never touches a prod project or the prod `cohort-context` bus.

## Run

```bash
npm run test:scale                       # N = 100, 1k, 5k (wraps emulators:exec)
SCALE_SIZES=100,500 npm run test:scale   # custom sizes
```

## What it measures

Firestore **doc-reads** (the billing unit) and **p50/p95/p99 latency** for:

1. **Board load** — the tasks one project screen subscribes to (`where projectId ==`).
2. **Broker tick (FULL)** — `lib/broker-admin.ts` `gather()`, which reads six whole collections
   (tasks, recipes, members, introductions, cohortMembers, githubLinks) every run.
3. **Broker tick (indexed)** — the same, but reading only stuck tasks via a `stuckSince` range
   query, to quantify the optimization.

## Results (emulator, 12 samples per measurement)

| N members | tasks | board load p95 | broker FULL reads/tick | broker FULL p95 | broker indexed reads | Δ reads |
|----------:|------:|---------------:|-----------------------:|----------------:|---------------------:|--------:|
| 100       | 200   | 15 ms          | 510                    | 61 ms           | 314                  | −38%    |
| 1,000     | 2,000 | 18 ms          | 5,100                  | 121 ms          | 3,205                | −37%    |
| 5,000     | 10,000| 75 ms          | 25,500                 | 358 ms          | 15,987               | −37%    |

## Findings

- **Board load scales fine.** It's a per-project indexed query — reads scale with tasks *in that
  project*, not the whole cohort; p95 stays ≤75 ms even at 5k members.
- **The broker `gather()` is the bottleneck** — it reads whole collections, so reads grow O(cohort):
  ~25k doc-reads/tick at 5k members. At Pulse's real cohort scale (~65 members) that's ~400
  reads/tick, and even at 5k it's ~25k reads once per **daily** tick — a negligible cost
  (well under a cent/day) and 358 ms p95, fine for a background job. So Pulse comfortably holds
  **past 1k to 5k**; the broker is a cost-shape to watch, not a wall.
- **Quantified fix path** (documented, not yet applied to `gather()` because it also uses the tasks
  read for helper knowledge): a `stuckSince` index on the tasks scan removes ~37% of the reads; the
  remaining cost is the member/cohortMember/githubLink full reads, which change slowly and could be
  cached between ticks. Applying both would keep the broker flat as the cohort grows.

**Ceiling:** no functional ceiling hit at 5k. The first thing to optimize if the cohort ever
reached thousands and the broker ran more than daily is `gather()`'s full-collection reads.
