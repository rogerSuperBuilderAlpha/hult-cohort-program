# Rally scale harness

A config-driven synthetic load harness that simulates a whole cohort (and beyond) talking at once,
then measures **where Rally breaks first**. Emulator-only — it refuses to run unless
`FIRESTORE_EMULATOR_HOST` is set, so it can never touch a real project (guardrail #1). All data is
synthetic (`Synthetic User N`); it never fabricates activity attributed to real people.

## What it measures

For each rung of N users it provisions profiles, channels, memberships, message history, an XP
ledger, and confirmed recognitions, then:

- **Live write workload** — `concurrentWriters` virtual users posting at a fixed rate for
  `holdSeconds`; reports post-latency p50/p95/p99 and sustained throughput.
- **Hot-doc contention** — many simultaneous channel *joins* on one channel doc (the client join is
  a read-modify-write transaction on `channels/{id}.memberUids`); reports join latency + failures.
- **Hot read paths**, replicating the EXACT queries in `lib/*-admin.ts` and `lib/data.ts` (source
  pointers in `harness.mjs`): leaderboard, Brief gather, channel page load, `find_teammate`,
  `summarize_channel`. The key signal is **docs read per call** — a query whose docs-read grows with
  total cohort *activity* (not the caller's own data) is an unbounded read.
- **Listener delivery latency** — post → `onSnapshot` delivery.

## Run it

```bash
# terminal 1
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
npm run emulator                      # or: firebase emulators:start --only firestore --project demo-rally

# terminal 2 — a single rung:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally \
  SCALE_USERS=1000 node scripts/scale/harness.mjs

# or the whole ladder (wipes the emulator between rungs), writing scripts/scale/results/*.json:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-rally \
  node scripts/scale/run-ladder.mjs 100 1000 5000
```

## Knobs (env vars, see `config.mjs`)

| var | default | meaning |
|---|---|---|
| `SCALE_USERS` | 100 | synthetic users |
| `SCALE_CHANNELS` | 10 | channels |
| `SCALE_CHANNELS_PER_USER` | 4 | membership fan-out |
| `SCALE_MESSAGES_PER_USER` | 8 | backfilled history |
| `SCALE_RECOGNITION_RATE` | 0.5 | fraction of messages that also confirm a recognition (drives xpEvents growth) |
| `SCALE_WRITERS` | 50 | concurrent live writers |
| `SCALE_HOLD_SECONDS` | 8 | live workload duration |
| `SCALE_POST_RATE` | 2 | posts/writer/second |
| `SCALE_PROBE_ITERS` | 20 | timing iterations per read path |

## Caveat

The Firestore emulator is a single process and not a faithful **latency** model of production
Firestore. Treat the latencies as relative, and the **docs-read-per-call** and **contention/failure**
counts as the load-bearing signals — those reflect real production cost and the real single-document
write ceiling. See `../../rally-specs/SCALE-REPORT.md` for the numbers, bottlenecks, and fixes.
