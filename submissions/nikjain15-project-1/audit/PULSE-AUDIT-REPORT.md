# Pulse — individual audit report

**Scope:** Pulse (`submissions/nikjain15-project-1`, Firebase `cursor-boston-project`) audited
adversarially across security, privacy, correctness, database/cost, resilience, and UX/voice, then
scale-tested to 5k synthetic members. Method: 6 parallel dimension auditors → adversarial verify
pass (try to *refute* each finding) → fix confirmed issues → guard each with a test.

**Result:** 45 findings surfaced (3 critical, 14 high, 15 medium, 13 low). Every confirmed
high/critical that was safely fixable was fixed and guarded; the few held back are documented below
with the reason and a fix path. Cross-app findings are in `CROSS-APP-AUDIT-REPORT.md`.

**Regression posture:** unit 627, rules 148, integration 55, e2e 66 — **896 tests**, typecheck + lint clean. Every count reproducible with `npm run gate`.
Scale harness (`scripts/scale/`) and cross-app suite (`npm run test:cross-app`) run green in one
command each.

---

## Fixed + guarded

### CRITICAL — `members.handle` was client-writable but is the cross-app identity key
`firestore.rules:56`. The members update rule constrained only `uid`; `handle` was free to change.
Every bus route maps the verified uid → `members/{uid}.handle` and trusts it (the bus writes with
the rule-exempt Admin SDK). Exploit: a signed-in member calls `updateDoc(members/self,{handle:'victimlogin'})`
(rules permit it — `isSelf`, uid unchanged), then GET `/api/context/memory` leaks the victim's
private cross-app notes, DELETE erases the victim's entire shared record across all cohort apps, and
POST `/api/context/dispatch` queues tasks under the victim's identity. **Fix:** `handle` is now
frozen once non-null (the null→GitHub-login backfill at sign-in still works), so an established
identity can't be repointed. **Guard:** `tests/rules/firestore.test.ts` — backfill allowed, repoint
denied; the prior "self-update succeeds" test (which updated `handle` and gave false confidence) was
corrected to a mutable field.
**Residual:** a *fresh* account can still first-claim a not-yet-registered handle; the complete fix
is a transactional `handleClaims/{handle}` uniqueness registry (a suite-level change, tracked in the
cross-app report). Pulse's real handles come from GitHub OAuth in a small known cohort, so the frozen
rule closes the practical attack (repointing a live account); the registry is the belt-and-braces.

### HIGH — broker introductions listener would fail in prod (no composite index)
`lib/introductions.ts:36` runs `where(helperUid ==) + orderBy(createdAt desc)` — a composite query
with no index, which throws `FAILED_PRECONDITION` in production and silently kills the entire broker
surface (the listener degrades quietly by design). **Fix:** `firestore.indexes.json` created with the
`helperUid+createdAt` index (and the `agentTasks` claim indexes); `firebase.json` now references it.
**Deploy note:** indexes must be pushed with `firebase deploy --only firestore:indexes` (or the
console auto-create link) — this is a manual step alongside the Vercel deploy.

### HIGH — `adminDb()` threw (500) instead of degrading (503) in a real misconfig
`lib/broker-admin.ts:35` keyed on `getApps().length === 0`. Once `busDb()` created the named `bus`
app (SHARED key set), that length is non-zero, so `adminDb()` skipped init and called
`getFirestore()` on a missing default app → threw → every bus route 500'd, exactly when
`SHARED_FIREBASE_SERVICE_ACCOUNT` is set but `FIREBASE_SERVICE_ACCOUNT` is not. **This is the same
class of bug that caused the live 500 incident during this session.** **Fix:** check for the
`[DEFAULT]` app specifically; degrade to null (→ 503) when the default can't be initialized.

### MEDIUM — ask-pulse bus operations could crash a plan
`app/api/ask-pulse/route.ts`. The shared-memory read and the `remember`/activity writes were awaited
without guards, so a transient Firestore error would 500 the whole planner — even though the shared
layer is meant to be additive/best-effort. **Fix:** wrapped in try/catch; a bus failure now degrades
to "ran without shared memory" / "couldn't save", never a crashed plan.

### HIGH (privacy/ethics) — `intro_made` now requires explicit, disclosed consent
`lib/broker-admin.ts`. The one public post ("{helper} unstuck {you} on …", cohort-visible, naming
the stuck person) fired when the stuck person marked a recipe "unstuck me" — but that action's UI
told them only the *author* would see it. A quiet member was named to all 64 people without knowingly
choosing it (a "never punish the quiet" violation). **Fix:** the private unstuck credit and the
public thank-you are now separate. A new `recipe.publicThanksUids` holds explicit opt-in consent
(rules: self-add only, author denied); `publishIntroMade` gates on *that*, not on `unstuckUids`. The
recipe UI corrects the "Steal" copy (credit is private to the author) and adds a distinct, clearly
disclosed "Thank {author} publicly" opt-in that states the consequence first. **Guard:** rules tests
(self-only consent, author denied, no create-time thanks) + a broker integration test proving unstuck
*without* consent never publishes and only explicit public-thanks does.

### LOW (voice) — regressions introduced by the new workflow-lanes feature
Dynamic lanes showed the banned phrase "Nothing here yet."; the workflow picker was below the 44px
touch target. **Fix:** lanes reuse the classic board's on-voice empty-state strings keyed by
canonical status; the picker meets 44px.

---

## Confirmed HIGH — documented, deliberately not changed tonight (with reason + fix path)

### `actorName` feed impersonation via a self-rename
`firestore.rules:238`. The pulse-create rule binds `actorName` to `members.displayName`, but
`displayName` is client-writable, so the check is circular: rename → "Marcus Chen", post a
`task_shipped`, rename back — the feed keeps the fabricated name (denormalized, never re-joined).
**Not changed because:** the sign-in backfill legitimately updates `displayName` (guess → typed
name) within the auth transaction, so a blanket freeze would break sign-in; and the airtight fix
(render `actorName` by joining `actorUid → members` at read time) contradicts the deliberate
denormalization (name-at-event correctness) and risks the pinned feed tests. **Fix path:** render-time
join for display with the denormalized value as fallback, OR freeze `displayName` only once `handle`
is set. Severity note: feed impersonation/sockpuppet, not data theft — and the critical handle-freeze
above already removes the cross-app abuse this could otherwise chain into.

### Unbounded full-collection task listener
`lib/data.ts:181` `subscribeToTasks` reads the entire `tasks` collection into one listener; fan-out
grows with the cohort (the documented WebChannel-collapse past ~45 members). **Not changed because:**
the fix (per-project subscriptions) is a broader refactor and the board already applies client-side
filters. **Quantified** by the scale harness below; **fix path** documented there.

### Orphaned `claimed` tasks never reclaim
`lib/shared-context.ts`. A task claimed by an app that then crashes stays `claimed` forever (no
timeout/reclaim). **Not changed because:** Pulse's inbox claims → runs → completes inside one request
(orphaning needs a mid-request crash — rare), and the adapter is kept byte-identical to Rally's for
the drift guard; adding reclaim needs careful idempotency to avoid double-execution. **Fix path:** a
reclaim window on stale `claimed` tasks, applied to both apps together.

---

## Medium/low backlog (surfaced, ranked, not all fixed)

Security: rate-limit key is a spoofable `X-Forwarded-For`; `optOuts` is world-readable (a **documented**
known trade-off — the pre-sign-in opt-out check needs it, see README). Privacy: no opt-out from the
stuck side; `aging_wip` infers "stuck" from card age. Correctness: a stale drag snapshot can regress
canonical status; dynamic-lane "+" drops a card into the first lane of its status (cosmetic);
`coerce()` doesn't dedupe column ids. DB/cost: the broker's six full-collection reads (see scale);
listener fan-out. UX/voice: sign-in error shows a raw Firebase message; a Settings empty state uses a
banned phrase; a couple of decorative glyphs. Full list in the audit workflow output.

---

## Scale / load test (100 / 1k / 5k synthetic members)

Harness: `scripts/scale/run.mjs` (`npm run test:scale`) — emulator-only (refuses to run without
`FIRESTORE_EMULATOR_HOST`), synthetic `zz-test-*` data torn down each run.

| N members | tasks | board load p95 | broker tick reads | broker p95 | indexed reads | Δ |
|----------:|------:|---------------:|------------------:|-----------:|--------------:|--:|
| 100       | 200   | 15 ms          | 510               | 61 ms      | 314           | −38% |
| 1,000     | 2,000 | 18 ms          | 5,100             | 121 ms     | 3,205         | −37% |
| 5,000     | 10,000| 75 ms          | 25,500            | 358 ms     | 15,987        | −37% |

- **Board load scales fine** — per-project indexed query, p95 ≤75 ms at 5k.
- **No functional ceiling hit at 5k** (well past the ≥1k bar). The broker's `gather()` is the
  O(cohort) cost (~25k reads/tick at 5k), but it's a **daily** background job — a fraction of a cent
  and 358 ms even at 5k. At Pulse's real ~65-member cohort it's ~400 reads/tick.
- **Fix path (documented, quantified):** a `stuckSince` index on the tasks scan removes ~37% of the
  reads; caching the slow-changing member/cohort collections between ticks removes most of the rest.
