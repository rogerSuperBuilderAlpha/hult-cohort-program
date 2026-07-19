# Rally — adversarial audit & hardening report

_Audit date: 2026-07-18/19 · Branch: `participants/summer26/phase-1-project-2/nikjain15` · Gate:
**green** (typecheck · lint · 76 unit · 49 rules · 53 integration · e2e smoke)._

---

## Executive summary (read me first)

Rally was audited adversarially across seven lenses (security/anti-gaming, privacy, correctness,
database/cost, resilience, UX/a11y, positioning) using a multi-agent workflow: each lens tried to
**break** the system, and every candidate finding was then **independently verified** by a skeptic
agent that re-read the code to refute it. 25 agents, ~1.2M tokens. False alarms were discarded; only
verified defects are below.

**The core was already strong.** Direct XP minting, self-confirmation, cross-channel reads,
reaction spoofing, webhook forgery/replay, and body-edit smuggling are all genuinely prevented by
`firestore.rules` + the server-only ledger — verified, not assumed. What the audit found were holes
at the **edges** of that design, plus scale limits under real load.

**What broke and is now fixed + test-guarded:**

| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | **High** | Collusive XP farming: `/api/detect` trusted a client `sourceMsgRef`, and the confirm route was unthrottled — two accounts could mint XP from fabricated message refs | Anchor every suggestion to a message the caller **actually authored** (`lib/source-ref.ts`), rate-guard the confirm route |
| P1 | **High** | `xpEvents` was world-readable — any signed-in client could scan the ledger and reconstruct the full "who's behind" ranking, defeating the neighbors-only promise | Rules now allow reading **only your own** ledger rows; the full order stays server-only |
| C1 | **High→Med** | `claimTasks` filtered by handle *after* an unordered window — a busy queue could starve one user's cross-app tasks forever | Push the handle filter into the query + `orderBy(createdAt)` |
| B1 | **Med** | No `firestore.indexes.json` — two core client listeners (channel rail, threads) would throw `FAILED_PRECONDITION` in production while tests stayed green | Added `firestore.indexes.json` (4 composite indexes) + wired `firebase.json` |
| S2 | **Med** | Commitment on-time XP gate bypassable — the owner could push `dueAt` into the future (or flip `status`) before closing the issue | Rules freeze `dueAt`/`status`/`pmExternalId`; clients edit text only |
| PR1 | **Med** | Secondary UI text (`--slate-400`) failed WCAG AA contrast (2.95:1) | Darkened to `#667085` (~4.95:1) |
| PV1 | **Low** | Right-to-erasure missed `agentTasks` (intents/payloads survived "be forgotten") | `forgetShared` now sweeps the user's `agentTasks` too |
| U1 | **Low** | Signed-out "Continue with GitHub" was a link that only *routed* — it didn't start sign-in | Now a button that calls `signInWithGithub()` |
| U2 | **Low** | Async assistant replies weren't announced to screen readers | `aria-live="polite"` on the thread, `role="alert"` on the error |

**Scale:** proven to hold at **1,000+ concurrent synthetic users**; the leaderboard's ledger-scan
bottleneck (44,760 doc reads/call at 5k) was fixed with an invariant-preserving TTL cache. One
residual ceiling (single-channel join contention) is documented with its fix path. See
[SCALE-REPORT.md](SCALE-REPORT.md).

**Known limitations (documented, not fixed):** modal focus-trap/Escape and a couple of low-severity
a11y polish items are listed at the end as recommended follow-ups; the in-memory rate limits remain
best-effort per-instance (a shared Firestore counter is the documented next step).

---

## Methodology

- **Fan-out, then verify.** Seven lens agents enumerated concrete attacks and read the actual code;
  a second wave of skeptic agents tried to *refute* each finding against `firestore.rules`, the
  tests, and the degraded paths. Findings that didn't survive verification (e.g. "leaderboard leaks
  the bottom of the board", "assistant reads break the 503 contract") were dropped.
- **Every fix ships with a test** that now guards the invariant, and the full gate stays green.
- **Guardrails respected throughout:** no "AI" in the UI (`grep` clean), ledger-not-counters
  preserved (no stored per-user total introduced), neighbors-only kindness strengthened, synthetic
  data only, Rally-only scope.

---

## Confirmed findings — detail, repro, fix, guard

### S1 · High · Automated collusive XP farming
**Files:** `app/api/detect/route.ts`, `app/api/recognitions/[id]/confirm/route.ts`,
`lib/recognition-admin.ts`

**Scenario.** Accounts A and B collude. A POSTs `/api/detect` with `body:"thanks @B unblocked me"`
and a *fabricated* `sourceMsgRef` (`channels/x/messages/1`, `/2`, …) each time. The route never
checked that A authored a message at that ref; `suggestRecognition` dedupes by ref-hash, so each
distinct fake ref seeded a fresh suggested recognition (helper=B, helped=A). A then POSTs the
(unthrottled) confirm route — `confirmRecognition` only requires `helpedUid === actingUid`, which A
satisfies — awarding B 8–12 XP with **zero real help**. Reciprocated, this mints hundreds of XP/min.
The "helped peer confirms" premise collapses because one account controls both sides.

**Fix.** `lib/source-ref.ts` `isAuthoredSource()` requires the `sourceMsgRef` to point at a message
that **exists, sits in a channel the caller belongs to, and was authored by the caller** before any
suggestion is seeded (`/api/detect` returns `403 invalid_source` otherwise). This bounds suggestions
to real participation — you can only credit someone from a thank-you you genuinely wrote. The confirm
route now also carries a `30/min` rate-guard.

**Guards.** `tests/unit/source-ref.test.ts` (parser), `tests/integration/source-ref.test.ts`
(accepts authored source; rejects fabricated / non-authored / non-member / malformed).

**Residual (documented):** a per-`(helper,helped)`-pair cap and a shared/persistent rate store are
recommended further hardening — the in-memory guard is best-effort per warm instance (as documented
for all Rally rate limits).

### P1 · High · `xpEvents` world-readable → full ranking reconstructable
**File:** `firestore.rules` (xpEvents match)

**Scenario.** The old rule was `allow read: if signedIn()`. Any member could `getDocs(xpEvents)`,
sum by `profileUid`, and rebuild the exact full ranking — the public "who's behind" scoreboard that
"be kind to the quiet" (guardrail #4) explicitly forbids. The neighbors-only server computation was
moot because the raw ledger was open.

**Fix.** `allow read: if signedIn() && isSelf(resource.data.profileUid)` — a client reads only its
**own** rows (enough for its own XP counter, `lib/data.ts:414`), never the whole collection. The
leaderboard is computed server-side (Admin bypasses rules) and still never returns the full order.

**Guards.** `tests/rules/firestore.test.ts`: "lets a member read their OWN ledger row" +
"denies reading ANOTHER member's ledger row".

### C1 · High→Medium · `claimTasks` starvation
**File:** `lib/shared-context.ts`

**Scenario.** `claimTasks` fetched an **unordered** `limit(limit*2)` page of pending tasks, then
filtered by handle client-side. If that page happened to be full of *other* handles' pending tasks,
the target user's task was never in the window and could starve indefinitely.

**Fix.** Push the handle equality into the query and `orderBy('createdAt','asc')` so the oldest
pending task for that handle is always claimed first.

**Guards.** `tests/integration/shared-context.test.ts`: "claims a specific handle's task even when
many other handles are pending (no starvation)".

### B1 · Medium · Missing composite indexes (prod-only crash)
**Files:** `firestore.indexes.json` (new), `firebase.json`

**Scenario.** The emulator serves any query without indexes, so tests were green — but in production
Firestore, `subscribeChannels` (`memberUids array-contains + orderBy createdAt`) and `subscribeThread`
(`parentId == + orderBy createdAt`) require composite indexes and would throw `FAILED_PRECONDITION`
on first load. The new `claimTasks` query needs them too.

**Fix.** Added `firestore.indexes.json` with the four required composite indexes (channels, messages
thread, and both `agentTasks` claim variants) and wired it into `firebase.json`. Deploy with
`firebase deploy --only firestore:indexes --project rally-14e17`. (Equality-only multi-field queries
like `recognitions helpedUid+status` are served by single-field merge — no composite needed.)

### S2 · Medium · Commitment on-time gate bypass
**File:** `firestore.rules` (commitments update)

**Scenario.** The rule only blocked `pmTaskUrl`/`points`. `onTime` is judged against the stored
`dueAt` at completion, so a late owner could `updateDoc({ dueAt: <far future> })` before closing the
GitHub issue and collect the on-time bonus retroactively. Flipping `status` or retargeting
`pmExternalId` was likewise open.

**Fix.** `!changed().hasAny(['pmTaskUrl','points','dueAt','status','pmExternalId'])` — clients edit
text only.

**Guards.** `tests/rules/firestore.test.ts`: denies pushing `dueAt` forward; denies flipping
`status`/`pmExternalId`; still allows editing text.

### PV1 · Low · Right-to-erasure missed `agentTasks`
**File:** `lib/shared-context.ts` (`forgetShared`)

**Scenario.** `forgetShared` erased shared memory + activity but not the user's `agentTasks`, whose
free-text `intent`/`payload` survived a "be forgotten" request.

**Fix.** `forgetShared` now also deletes `agentTasks where handle == contextKey(handle)`.

**Guards.** `tests/integration/shared-context.test.ts`: "forgetShared also erases the person's
agentTasks (intents/payloads must not survive)", asserting others' tasks are untouched.

### PR1 · Medium · WCAG AA contrast failure
**File:** `app/globals.css`

`--slate-400 #8898aa` (timestamps, section labels, `@handles`, band subtitles) was 2.95:1 on the
near-white background — below AA (4.5:1) at the small sizes it renders at. Darkened to `#667085`
(~4.95:1). **Verified in-browser:** computed value `#667085`.

### U1 · Low · Mislabeled signed-out CTA
**File:** `components/app-shell.tsx`

"Continue with GitHub" was a `<Link href="/channels">` that only routed to a second button. Now a
`<button onClick={signInWithGithub}>`, matching the channels screen. **Verified in-browser:** the CTA
is now a `<button>` element.

### U2 · Low · Assistant updates not announced to screen readers
**File:** `components/rally-agent.tsx`

Added `aria-live="polite"` + `aria-busy` to the assistant thread and `role="alert"` to the
unavailable message so replies, the "thinking" status, and errors are announced.

---

## Verified-clean (attacked, held) — evidence

These were actively attacked and **held**; recording them is part of the audit:

- **Direct XP/pulse minting** — `xpEvents`/`pulseEvents`/`recognitions` are `create,update,delete:
  false` for clients; only Admin routes write them.
- **Self-confirmation** — `suggestRecognition` returns null when helper===helped;
  `confirmRecognition` rejects `self_award`; confirm uses the verified token uid, never a body uid.
- **Cross-channel / private read** — messages gate on `request.auth.uid in channelMemberUids`;
  private channels/DMs are members-only even at the doc level; `summarize_channel` is restricted to
  `array-contains` membership.
- **Reaction spoofing / body-edit smuggling** — `reactionTogglesSelf` proves a reactions update
  touches only the caller's key; the author-edit and reaction-toggle branches are mutually exclusive.
- **Membership inflation** — `togglesOnlySelf` + `noDuplicates` prevent adding anyone but yourself or
  faking a count with duplicate uids.
- **Webhook forgery/replay** — HMAC-SHA256 constant-time verification over the raw body;
  `completeCommitment` is idempotent (`status==='done' → alreadyDone`), so a replay awards once.
- **Recognition double-award** — deterministic ledger ids (`xp_help_<recId>`) make confirm
  idempotent even under a rules-bypassing re-run.
- **Bus isolation** — `cohortContext`/`agentTasks` are deny-all for clients; the handle is derived
  from the caller's own profile, not a request body.
- **Detection integrity** — model output is schema-validated and only ever produces a *suggested*
  recognition (never points); degrades to the deterministic detector.
- **Graceful degradation** — with `ANTHROPIC_API_KEY` / `FIREBASE_SERVICE_ACCOUNT` /
  `SHARED_FIREBASE_SERVICE_ACCOUNT` unset, routes return null/503 and core comms keep working (the
  "assistant breaks the 503 contract" finding was **refuted** — `runAssistant` wraps its work and
  returns `{available:false}`).

---

## Known limitations & recommended follow-ups

1. **Prompt-injection → memory note (low).** A crafted message could lead the assistant to `remember`
   an attacker-suggested note. Impact is bounded (notes are per-user, non-points-bearing, user-visible
   and erasable), but a confirmation step before `remember` writes, or tighter tool-use gating, would
   close it.
2. **`assistantMemory.notes` `arrayUnion` growth (low).** Unbounded over a long-lived account; cap to
   the last N notes or migrate to a subcollection.
3. **Modal focus-trap / Escape-to-close (low).** `DmModal` and the Ask-Rally overlay lack a focus
   trap, Escape handler, and `aria-modal`. Recommended a11y follow-up.
4. **Rate limits are best-effort per-instance.** A shared Firestore counter is the documented next
   step for a hard cross-instance quota (applies to detect/confirm/assistant/ask).
5. **Single-channel join contention** — see [SCALE-REPORT.md](SCALE-REPORT.md); onboarding-burst
   ceiling with an `arrayUnion`/sharded-membership fix path.
