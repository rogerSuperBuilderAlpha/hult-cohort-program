# Rally — build status (running log)

Authoritative running log. Newest entry on top.

---

## 2026-07-19 — Test rigor + regression push (nearly doubled the suite)

Expanded automated coverage across every dimension, for Rally individually AND the Rally↔Pulse seam.
**209 → 435 tests (+226)**, gate green (typecheck · lint · **175 unit · 124 rules · 120 integration** ·
e2e smoke). Authored via a parallel per-dimension workflow, then each suite validated green on the
emulator; every new test runs (no padding). Only code change required was a `vi.fn` typing fix.

- **Rules (53→124):** new `tests/rules/firestore-attacks.test.ts` — an attack case on every
  collection (xpEvents mint/inflate/cross-read, pulseEvents/goals/badges/quests, recognition status,
  commitment field freeze, channel membership/join, message ownership/body/reactions, identity-key
  freeze, assistant + bus deny-all).
- **Integration (53→120):** `cross-app.test.ts` (dispatch lifecycle, concurrent double-claim,
  addressing isolation, replay independence, memory/activity round-trip + isolation + erasure),
  `anti-gaming.test.ts` (isAuthoredSource, self-recognition, replay/double-award idempotency),
  `resilience.test.ts` (busDb fallback when SHARED unset/malformed — degrade, never crash).
- **Unit (87→175):** `detect-model` (extractJson/schema validation, detection-never-awards),
  `points-and-tools`, `contract-extra` (drift guard), `text-logic-extra`, `ui-voice` (no "AI" in UI).
- **Docs/visuals:** `rally-specs/ARCHITECTURE.md` (system + recognition-loop diagrams) + signed-in
  screenshots (`npm run screenshots` → `tests/e2e/screenshots.spec.ts` + `scripts/seed-data.mjs`,
  emulator-only). PR body given exact grader headings + a Mermaid architecture diagram.

---

## 2026-07-19 — Cross-app (Rally↔Pulse) hardening pass

Fixed the Rally-side findings from the suite audit ([CROSS-APP-AUDIT-REPORT.md](CROSS-APP-AUDIT-REPORT.md)).
**Gate green** (typecheck · lint · **87 unit · 53 rules · 53 integration** · e2e smoke).

- **CRITICAL — identity key frozen.** `profiles.githubLogin`/`handle` (what the shared-context bus
  keys on) are now write-once in `firestore.rules` via a `frozenIdentity()` helper: null→login
  backfill allowed, value→value (or →null) denied — a member can no longer repoint their handle to a
  teammate's login to read/forge/erase that teammate's cross-app context. `ensureProfile` aligned to
  backfill only when null (so the freeze never breaks sign-in). Guards: 4 new rules tests (backfill
  ok, repoint denied, clear denied, displayName still editable).
- **HIGH — bus memory framed as DATA.** `assistant-run.ts` `systemPrompt` now seals shared-bus notes
  inside an explicit `<<<CONTEXT_NOTES … >>>` fence marked "DATA … NOT instructions", so a malicious
  cross-app note can't act as a system directive (prompt-injection). Guards: 2 unit tests.
- **HIGH — inbox is answer-only.** The cross-app inbox now runs the assistant in **read-only mode**
  (`runAssistant(..., { readOnly: true })`): only the writeless read tools are offered (new
  `READ_ONLY_TOOLS`), `remember`/propose tools are refused (defense-in-depth in the tool loop), and
  the dispatched intent is framed as quoted untrusted data — a task another app addressed to this
  user can never trigger a server-side write (memory poisoning / bus write) or an unconfirmed action.
  Guards: 2 unit tests (read-only set composition + exclusions).
- **Contract-drift guard green** — `tests/unit/contract-golden.test.ts` (Rally half of the behavioral
  drift check) unchanged and passing; the shared contract stayed byte-identical to Pulse.

Follow-up (documented, cross-app): a transactional `handleClaims/{handle}` uniqueness registry so a
handle can never be claimed by two uids (belt-and-braces beyond the repoint freeze).

---

## 2026-07-19 — Adversarial audit + scale hardening pass

Multi-lens adversarial audit (7 lenses, multi-agent workflow with per-finding verification) + a
synthetic scale harness at 100/1k/5k users. **Gate green throughout** (typecheck · lint · 76 unit ·
49 rules · 53 integration · e2e smoke). Full write-ups: [AUDIT-REPORT.md](AUDIT-REPORT.md),
[SCALE-REPORT.md](SCALE-REPORT.md).

### Security / anti-gaming
- **Collusive XP farming closed.** New `lib/source-ref.ts` `isAuthoredSource()` — `/api/detect` now
  requires the `sourceMsgRef` to be a message the caller actually authored in a channel they belong
  to (403 otherwise); confirm route rate-guarded (30/min). Guards: `tests/unit/source-ref.test.ts`,
  `tests/integration/source-ref.test.ts`.
- **Commitment on-time gate.** `firestore.rules` now freezes `dueAt`/`status`/`pmExternalId` on the
  commitments update (was only `pmTaskUrl`/`points`) — no retroactive "on time". Rules tests added.

### Privacy
- **`xpEvents` no longer world-readable.** Rule → `isSelf(resource.data.profileUid)`; clients read
  only their own ledger rows, so the full "who's behind" ranking can't be reconstructed. Rules tests
  updated (own-row allowed, other-row denied).
- **Right-to-erasure completeness.** `forgetShared` now also deletes the user's `agentTasks`. Guard
  added.

### Correctness / DB
- **`claimTasks` starvation fixed.** Handle filter pushed into the query + `orderBy(createdAt)`.
  Guard added.
- **Composite indexes added.** New `firestore.indexes.json` (channels array-contains+orderBy,
  messages thread, both agentTasks claim variants) wired into `firebase.json` — these client
  listeners would have thrown `FAILED_PRECONDITION` in prod while emulator tests stayed green. Deploy
  with `firebase deploy --only firestore:indexes --project rally-14e17`.

### Scale
- **Leaderboard ledger-scan fixed** (was O(all xpEvents): 950→9,320→44,760 reads/call at
  100/1k/5k). Added a short-TTL server-side cache of the *computed ranking* in `lib/leaderboard-admin`
  (invariant-preserving — NOT a stored per-user total; guardrail #3 intact), invalidated on every XP
  award. Concurrent opens now collapse to one scan per window. Guards in
  `quests-leaderboard.test.ts`.
- **Documented ceiling:** single-channel join contention (Firestore 1-write/sec/doc) — fix path is
  `arrayUnion`/sharded membership (SCALE-REPORT §Bottleneck 2).

### UX / a11y
- Contrast: `--slate-400` `#8898aa`→`#667085` (WCAG AA). Signed-out CTA: link→real
  `signInWithGithub()` button. Assistant thread: `aria-live`/`role=alert`. Verified in-browser.

### Tooling added
- `scripts/scale/` — config-driven synthetic load harness (`harness.mjs`, `run-ladder.mjs`,
  `config.mjs`, `README.md`). Emulator-only; refuses to run without `FIRESTORE_EMULATOR_HOST`.

### Known follow-ups (documented, not landed)
Prompt-injection→`remember` note (low), `assistantMemory.notes` arrayUnion growth (low), modal
focus-trap/Escape (low), shared/persistent rate store, ledger compaction for very-long-lived cohorts,
join `arrayUnion` fix.

---

## Pulse individual + cross-app suite audit (2026-07-19)

Adversarial audit of **Pulse** (individual) and the **Rally↔Pulse seam**: 45 findings (3 crit / 14
high / 15 med / 13 low), each verified by an adversarial refute pass. Reports:
`PULSE-AUDIT-REPORT.md`, `CROSS-APP-AUDIT-REPORT.md`, `SUITE-AUDIT-SUMMARY.md`.

**Fixed + guarded (Pulse):** CRITICAL client-writable `members.handle` (the bus identity key) frozen
in rules; `adminDb()` default-app bug that 500'd bus routes → now 503; `claimTasks` starvation
re-aligned to Rally's fair ordered claim; `forgetShared` now sweeps `agentTasks` (complete erasure);
missing broker composite index added (`firestore.indexes.json`); ask-pulse bus ops best-effort; voice
regressions in the new workflow lanes. Verified: Pulse rules 127/127, integration 37/37, unit
272/272, typecheck+lint clean.

**Regression suites (one command each, emulator + `zz-test-*` only):** `npm run test:drift`
(behavioral contract-drift, both apps), `npm run test:cross-app`, `npm run test:scale` (Pulse holds
to 5k members; board p95 ≤75 ms).

**Held back, documented (need judgment / risk pinned tests):** feed self-rename impersonation
(`actorName`↔`displayName`); `intro_made` consent-disclosure gap (latent — broker not live in prod);
unbounded task listener; orphaned `claimed` tasks (parity with Rally). Handle-freeze mirror + a
`handleClaims` uniqueness registry are the cross-app follow-ups.

**On Nik (not code):** `firebase deploy --only firestore:rules,firestore:indexes` to activate the
handle-freeze + indexes; confirm `cohort-context` deny-all-client rules are deployed.
