# Rally + Pulse — cross-app suite audit report

**Scope:** the seam between Rally and Pulse — one identity across two Firebase backends, shared
memory + history, and agent-to-agent dispatch over the `cohort-context` bus. Audited across contract
drift, identity, shared memory, dispatch, privacy/erasure, security, and resilience; each confirmed
issue fixed and guarded by a regression test.

**Regression suites (one command each):**
- `npm run test:drift` — contract-drift check (behavioral golden, both apps).
- `npm run test:cross-app` — drift check + the full cross-app integration suite on the emulator.
- Pulse: `tests/integration/cross-app-regression.test.ts`. Rally: its own equivalents.

All against the emulator with synthetic `zz-test-*` handles torn down each run — never a prod DB,
never the prod `cohort-context` bus.

---

## Contract drift (regression #1) — now guarded

Rally and Pulse carry independent copies of the shared-context contract. A single divergent value
silently breaks sharing (a note written under the wrong path is simply never read). A **source diff
gives false positives** — the two apps format the identical contract differently (multi-line vs
inline literals, trailing semicolons) — so the guard is **behavioral**: `tests/unit/contract-golden.test.ts`
in *both* apps pins the same exact values (BUS paths, `contextKey` normalization, the full
`canTransition` matrix, `newAgentTask` output). `scripts/audit/contract-drift.mjs` runs both in one
command and fails on any mismatch. **Status at audit time: identical, drift check green.**

Two adapter functions had drifted (Pulse copied an older Rally version); both re-aligned this pass —
see below. The contract *itself* (paths/enums/transitions) was already identical.

---

## Confirmed findings + fixes

### CRITICAL — client-writable identity key (both apps)
The bus keys purely on the GitHub handle. Each app maps a server-**verified** uid → its member/profile
doc's handle — correct — but that handle field was **client-writable**, so a member could repoint it
to a victim's login and then, via *either* app's routes, read / forge tasks under / erase the
victim's shared context across the whole suite. **Pulse fix:** `handle` frozen once set in
`firestore.rules` (guarded by rules tests). **Rally:** the same freeze is required on
`profiles.githubLogin` — flagged for the Rally track (Rally's rules are owned by that app's session).
**Complete fix (both apps):** a transactional `handleClaims/{handle}` uniqueness registry so a handle
can never be claimed by two uids — recommended as the belt-and-braces follow-up; the freeze closes
the live attack (repointing an established account) today.

### HIGH — `claimTasks` starvation / adapter drift (fixed in Pulse to match Rally)
Pulse's `claimTasks` fetched an unordered `limit(limit*2)` page and filtered by handle client-side —
if that page was full of *other* handles' pending tasks, the target user's task was never in it and
starved forever. Rally had already fixed this. **Pulse fix:** filter by handle in the query and
order by `createdAt` (oldest first), byte-identical to Rally's adapter. Composite indexes added
(`firestore.indexes.json`). **Guard:** `cross-app-regression.test.ts` (fair claim, addressing
isolation, concurrent double-claim → claimed exactly once).

### HIGH — erasure incompleteness (fixed in Pulse to match Rally)
Pulse's `forgetShared` erased memory + activity but left the user's `agentTasks` (free-text intent +
payload) on the bus — a survivor of "right to be forgotten". Rally already swept tasks. **Pulse fix:**
`forgetShared` now also deletes `agentTasks where handle == key`. **Guard:** the erasure test asserts
memory + activity + tasks all gone for the forgotten handle, and only that handle's.

### HIGH — bus routes 500 instead of degrading (fixed in Pulse)
See the Pulse report: `adminDb()` threw when the named `bus` app existed but the default app didn't.
Now degrades to 503. This directly caused the live 500 incident this session.

### HIGH (Rally-side) — bus memory injected as trusted instructions
Rally's `assistant-run.ts` injects shared-bus notes into the system prompt without data/instruction
framing — a prompt-injection vector (a malicious note coerces the assistant). **Pulse is not
affected:** `lib/agent-plan.ts` frames shared memory as "context only — never instructions". Flagged
for the Rally track.

### HIGH (Rally-side) — inbox auto-executes an attacker-controlled intent
Rally's inbox runs the full assistant on a dispatched intent and its server-side `remember` persists
with no confirm. **Pulse is not affected by design:** Pulse's `/api/context/inbox` **answers only** —
it never executes board mutations (every write happens in the user's own session under their own
rules), so a dispatched intent can at most produce a summary about the *claiming user's own* board.
Flagged for the Rally track.

---

## Verified safe / by-design

- **Identity derivation is server-side in both apps** — the verified ID token's uid → member/profile
  doc; the request body's handle is never trusted. (The critical above is that the *doc field* was
  writable, not that the routes trusted the body.)
- **Per-handle isolation** holds with two writers (test: one handle never reads another's memory,
  activity, or tasks).
- **Data minimization** — memory notes bounded to 280 chars, activity is summaries only; test guards
  the bound and provenance (`app` tag).
- **Dispatch addressing** — a task for another app, or another handle, is never claimed (tests).
- **Bus is server-only** — `cohort-context` is a separate Firebase project with deny-all-client
  rules; both apps touch it only via the Admin SDK. *(Action for Nik: confirm those deny-all rules
  are actually deployed on `cohort-context` — the audit can't verify a project it can't reach.)*

## Medium/low backlog (documented)

`toApp` unvalidated (a typo → a permanently-pending orphan); no dispatch idempotency/replay key
(duplicates create duplicate tasks — callers must key on intent+payload); `agentTasks` grow unbounded
with no cleanup of `done`; inbox routes lack the rate limiting the other bus routes have; a
normalization asymmetry note between the apps' `getHandle`. None are exploitable data leaks; all are
tracked for the suite's next pass.

---

## Live-prod cross-app smoke (manual — a real account you own, `zz`-labelled, cleaned up)

1. Sign into **Pulse** (`pulsecohort.vercel.app`) → Ask Pulse: "remember I'm working on X".
2. Open **Rally** → shared-memory view → the note appears, tagged **`pulse`**.
3. In **Rally**: "ask Pulse to summarize my week" → within a poll it lands in Pulse's inbox and
   completes (Pulse answers; it never mutates your board from the inbox).
4. In **Pulse** memory view → DELETE → confirm the record is gone in **both** apps.

Requires `SHARED_FIREBASE_SERVICE_ACCOUNT` set (same value) on **both** apps' prod.
