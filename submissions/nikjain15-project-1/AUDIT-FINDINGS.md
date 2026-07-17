# Pulse — Red-team hardening pass: findings

A break → **learn** → fix log. For each defect: how it breaks, the repro, the *root-cause
lesson* (so the class doesn't recur), the fix, and the regression test that now guards it.

**Verification key**
- `INTEGRATION` — driven through the real client SDK against the live emulator, with the
  real `firestore.rules` applied (`tests/integration/`). For server-side transaction bugs
  this is stronger proof than a browser click.
- `RULES` — asserted allowed/denied against the emulator (`tests/rules/`).
- `BROWSER` — watched work in a real browser, per the "done = driven in a browser" bar.
- `UNIT` — pure-logic assertion.

Every fix ships with a test that is **red before the fix and green after**.

---

## The class we are hunting

Bugs that pass typecheck, lint, and 240+ tests but surface the moment a real person
connects a real account. They share a shape: **the failure lives in the interaction
between two correct-looking pieces** (a delete and a re-sync; two tabs; a rule that checks
one field but not its neighbour), and the existing suites test each piece in isolation. The
new `tests/integration/` project exists to exercise those interactions against the real
Firestore, because that is the only place they show up.

---

## Item 1 — A deleted sensed card resurrects on the next sync  ·  FIXED

**Feature:** sensed cards (the board building itself) + delete.
**Dimensions:** QA correctness · Database model · UX honesty.
**Severity:** High — every real user who deletes a Pulse-built card hits it.

### How it breaks
Pulse builds a card from your branch/PR and writes on its face: *"Edit or delete it — it's
yours."* You delete it. Within 15 minutes the poll runs `syncFromGitHub` again, which calls
`createSensedTask` for the same branch, and the card **comes back**. The card's own promise
is a lie.

### Repro (`INTEGRATION`, red before fix)
`tests/integration/sensing.test.ts` → *"a card the user deletes stays gone across the next
sync"*:
1. `createSensedTask(actor, {branch: 'feat/real-branch', …})` → card created.
2. `deleteTask(id)` → card gone.
3. `createSensedTask(actor, {same branch})` → **card exists again** (`getDoc(...).exists() === true`).

Ran against the live emulator as a real signed-in user. Red before the fix.

### Root-cause lesson
`createSensedTask`'s transaction only asked *"does this document exist?"*. Deletion made the
answer "no", so the create path fired again. **A derived-id create-if-absent cannot tell
"never existed" from "deliberately removed."** Any idempotent-by-derived-id writer that a
user can also delete needs a record of the deletion, or it will treat the deletion as a gap
to fill. The `sensedTaskId` design deliberately makes a twin *unrepresentable* — but that
same determinism is what makes resurrection automatic.

### Fix
A **tombstone** keyed by the card's own derived id:
- `deleteTask` (`lib/data.ts`) now writes `tombstones/{sensedTaskId}` `{uid, createdAt}`
  *before* deleting the doc (tombstone-first closes the interleave window where a poll finds
  the card gone and the tombstone not yet there), for sensed cards only.
- `createSensedTask`'s transaction reads the tombstone alongside the task and returns
  `{created: false, tombstoned: true}` without writing when it exists.
- `syncFromGitHub` (`lib/sync.ts`) skips a tombstoned pull entirely — no rebuild, and no
  phantom entry in the same-run dedupe list (which would have made a later same-title pull
  try to move a card that no longer exists).
- `firestore.rules` gains a `tombstones` block: create only as yourself
  (`isSelf(uid)`), `hasOnly(['uid','createdAt'])`; update/delete denied — permanent, like
  `optOuts`. A tombstone anyone could lift is not a tombstone.

### Guarded by
`tests/integration/sensing.test.ts` (`INTEGRATION`). Rules coverage for tombstone
forgery/permanence added in `tests/rules/firestore.test.ts` (see Item 5 batch).

---

## Item 2 — Two tabs double-post the same ship into 64 feeds  ·  FIXED

**Feature:** the pulse feed (`task_shipped` / `task_started`).
**Dimensions:** Multi-user realtime · Database concurrency · QA.
**Severity:** High — anyone with the app open in two tabs, or on two devices, or whose
sync overlaps a manual move.

### How it breaks
`setTaskStatus` guards on `task.status === status` using the *snapshot it was handed*. Two
tabs each hold the pre-ship snapshot (`todo`). Both pass the guard, both `updateDoc`
(idempotent, fine), and both `logPulse` — which uses `addDoc`, a fresh id every call. The
cohort feed shows the same ship twice. The derived-id transaction that made twin *cards*
unrepresentable never covered the *event*.

### Repro (`INTEGRATION`, red before fix)
`tests/integration/double-post.test.ts`: create a task, take one stale `todo` snapshot,
fire `setTaskStatus(..,'done')` twice (two tabs). Count `task_shipped` events for that task
→ **2** before the fix, **1** after.

### Root-cause lesson
**An in-memory or snapshot-scoped guard cannot dedupe across tabs/devices** — the same
lesson as the twin card and the double `member_joined`. Idempotency has to live in the data
layer, addressed by the identity of the *thing*, not enforced by a check against
possibly-stale local state. This codebase already learned it for cards and members; the
feed event was the one write that still minted a fresh id.

### Fix
`logPulseOnce(eventId, event)` (`lib/pulse.ts`): a transaction that creates the event only
if a doc at `eventId` doesn't already exist. `setTaskStatus` now keys ship/start events by
the work — `ship_<taskId>` / `start_<taskId>` — so a second writer no-ops. Undo still
works: deleting the post removes the derived doc, so a genuine re-ship recreates it.

### Guarded by
`tests/integration/double-post.test.ts` (`INTEGRATION`).

---

## Item 5 — Trust-boundary holes: actorName impersonation + id-squatting  ·  FIXED

**Feature:** Firestore security rules (`pulse`, `tasks`).
**Dimensions:** Security rules · AI/privacy non-negotiables.
**Severity:** actorName forgery **Critical**; id-squatting **High**. Both independently
confirmed by two read-only reviewers; neither had any existing test.

### How they break — a signed-in peer hitting Firestore directly
1. **actorName impersonation.** The `pulse` create rule bound only `actorUid` to the
   caller. The feed renders the denormalised `actorName` verbatim and never re-joins to
   `members`, so a peer could append an event with *their own* `actorUid` but a **victim's
   `actorName`** and have it display as the victim. The rules' own promise — "nobody can
   fake a teammate shipping" — was only half-true.
2. **Sensed-card id squatting.** `sensedTaskId = s_<uid>_<fnv1a(branch|pr)>`; the uid is
   readable and the branch/PR is public, so the id is computable. The `tasks` create rule
   checked `isSelf(creatorUid)` but nothing about the doc id, so a peer could pre-create
   `s_<victim>_<hash>`. The victim's `createSensedTask` create-if-absent transaction then
   finds the squat and **no-ops forever** — that card can never appear on the victim's
   board, silently (a no-op reads as success), and the victim can't delete a doc they
   don't own.

### Repro (`RULES`, red before fix)
`tests/rules/firestore.test.ts`, new blocks:
- *"denies A posting under B's NAME even with A's own uid"* and *"…made-up actorName"*.
- *"nobody can squat a victim's sensed-card id"* (×4, incl. the manual-source dodge).

### Root-cause lesson
The recurring shape in this rules file, stated in its own comment: **"the rule reasons
carefully about WHO may write and not at all about WHAT / WHERE."** `actorUid` was checked;
the *name that renders* was not. `creatorUid` was checked; the *id that addresses the
document* was not. A denormalised field the UI trusts, and a derived id the app trusts, are
both part of the trust boundary and must be constrained by the rules, not just by the
honest client.

### Fix (`firestore.rules`)
- `pulse` create now also requires
  `actorName == get(members/$(uid)).data.displayName` — the one name a caller can't forge.
  Every honest write already sets exactly this, so the happy path is unaffected (verified:
  the real ship flow still logs in `double-post.test.ts`).
- `tasks` create now requires `sensedIdMatchesCreator(taskId, uid)`: any id shaped like a
  sensed id (`s_…`) must be `s_<self>_<8hex>`. Manual cards use addDoc auto-ids (no
  underscore), so open manual creation is untouched.

### Residual (documented, not fixed here — needs the Admin SDK)
`source`/`evidence` remain forgeable *at create time* (only frozen on update), and a
peer's fabricated `narrative`/`subject` free-text can still name a victim (now attributed
to the *attacker*, not the victim — the impersonation is closed, the free-text slander is
not). Both are in the README's stated security posture; closing them needs a server
identity. See Items on `/api` hardening below.

### Guarded by
`tests/rules/firestore.test.ts` (`RULES`) — 10 new assertions; suite 92 → 102.

---

## Item 3 — A fast PR (open + merge in one poll) ships silently  ·  FIXED

**Feature:** sensing → the feed. **Dimensions:** QA · AI/feed honesty.
**Severity:** Medium-High — the *common case for small work* (open a PR, merge it in
minutes), never announced.

### How it breaks
When a PR opens and merges between two 15-minute polls, Pulse's first sight of it is
already `merged`. `createSensedTask` builds the card straight into `done`, so the
transition path in `setTaskStatus` — the only place `task_shipped` was logged — never runs.
The next poll finds the card already `done` and logs nothing. The ship is **never**
announced.

### Repro (`INTEGRATION`, red before fix)
`tests/integration/sync.test.ts` → *"announces a PR that opened AND merged inside one poll
window"*: stub `/api/sense` with a merged pull, run `syncFromGitHub` on an empty board,
assert a `task_shipped` event exists → **0** before, **1** after. A second test asserts the
next poll does not re-announce (idempotent via `ship_<id>`).

### Root-cause lesson
"`setTaskStatus` is the only path that logs `task_shipped`" was load-bearing *and*
incomplete: it assumed every ship is a *transition*. A card can also be *born* shipped. The
decision was **announce it** — a merged PR is real work the cohort should see — with the
one exception that the first-sync backfill stays silent (history isn't news).

### Fix
`announceSensedShip` (`lib/data.ts`) logs the ship for a card created directly at `done`,
routed through the same idempotent `ship_<id>` key so it can never double with a later
transition. `sync.ts` calls it only on a live (non-backfill) create-at-done.

### Guarded by
`tests/integration/sync.test.ts` (2 tests, `INTEGRATION`).

---

## Item 4 — Sync drags a human's manual `done` back  ·  FIXED

**Feature:** sensing status inference. **Dimensions:** QA · UX (the human must win).
**Severity:** High — anyone who finishes a task by hand before its PR merges.

### How it breaks
You move a card to `done` by hand while its PR is still open. Next poll: the open PR infers
`in_progress`, `existing.status ('done') !== inference ('in_progress')`, so
`setTaskStatus(.., 'in_progress')` **drags your completed card back**. Pulse overrules a
person.

### Repro (`INTEGRATION`, red before fix)
`tests/integration/sync.test.ts` → *"does not drag a human-completed card back when the PR
is still open"*: build a card, ship it by hand, then sync with the PR still `open`. Card
status → `in_progress` before the fix; stays `done` after.

### Root-cause lesson
Status inference treated GitHub as the sole source of truth and applied it in **both
directions**. But Pulse's job is to *advance* a board, not to *reconcile* it against GitHub
— a completion is the strongest human signal there is, and a tool that undoes your work
teaches you to distrust it. The rule: **sync advances, never regresses out of `done`.**
(A genuine merge infers `done` too, so a real ship is never blocked; a closed-unmerged PR
still moves an *in-progress* card back to todo, which is intended.)

### Fix
One guard in `sync.ts`: `if (existing.status === 'done' && inference.status !== 'done')
continue;`, placed before both the backfill and live branches so the human wins regardless.

### Guarded by
`tests/integration/sync.test.ts` (`INTEGRATION`).

---

## Item 6 — Consent honesty  ·  ALREADY CORRECT (verified, no change)

**Feature:** consent / narration gate.

- **`ask_first` suppresses auto-narration** — implemented in a prior pass:
  `autoNarrationAllowed(link)` (`lib/sense.ts`) gates on
  `narrationOptIn && handle && mode !== 'ask_first'`, and `narrateShip` (`lib/sync.ts:250`)
  calls it. Unit-tested at `tests/unit/sense.test.ts:670–690`. **No defect.**
- **Freshly-connected Home "posted row" is not a broken empty shell** — verified by reading
  `components/Home.tsx:95–101`: when there is no posted row and status isn't `declined`,
  the branch evaluates to `false` and React renders *nothing* (no empty box).
  `findPostedRow` currently returns null for everyone, so the shell never appears.
  Confirmed in a browser: the declined/not-connected home renders a clean "Your board is
  ready · Add a task myself" state. **No defect.**

---

## Dimension sweep — reviewer findings, triaged

Two read-only reviewers swept the rules/DB and appsec/LLM surfaces. **XSS: clean** (no
`dangerouslySetInnerHTML` on any sensed field; React auto-escaping never bypassed).
**Secrets in bundle: clean** (`ANTHROPIC_API_KEY`/`GITHUB_TOKEN` server-only, never
`NEXT_PUBLIC_`). Findings that survived my verification:

| Finding | Verdict | Disposition |
|---|---|---|
| pulse `actorName` impersonation | real, critical | **FIXED** (Item 5) |
| sensed-id squatting | real, high | **FIXED** (Item 5) |
| `checkNarrative` Unicode/zero-width evasion | real | **fixing** — see AI-safety item below |
| `checkNarrative` displayName carve-out (4a) | real, narrow | **documented residual** — requires attacker to rename self to victim; my actorName binding already forces the feed to show the collision. Closing it fully means rejecting all same-name narratives to facts-only (safe but lossy); deferred as a product call. |
| `checkNarrative` first-name-only vs null-handle multi-word name (4b) | real, narrow | **documented residual** — the whole-token match is a deliberate precision/recall choice; splitting into first-names would over-reject legitimate narratives about the actor. |
| single-slot narration cache double-narrates ≥2 shipped PRs | real | **documented** — `narrationCacheKey` is one scalar per member but keyed per-PR; a second shipped PR overwrites the first, so re-sensing PR #1 misses cache. Budget/spam risk. Fix needs a per-work cache map (deferred; noted for the roadmap). |
| `/api/narrate` unauth cost amplification | real, acknowledged | README security posture documents unauth + bounded inputs; per-caller rate limit is the stated roadmap item. Not a regression. |
| `/api/opt-out` unauth irreversible tombstone | real, acknowledged | README documents this as a deliberate "no signup wall on the exit" tradeoff; Admin SDK is the stated fix. |
| archive/rename shared `repo_*` project hides everyone's cards | real | **documented residual** — overlaps the README's "any member can edit any project" tradeoff; a targeted `repo_*`-archive guard is a candidate fix but changes the open-collaboration model. Flagged. |
| create-time `source`/`evidence` forgery | real, acknowledged | README security posture; needs Admin SDK. PR numbers stay public/checkable. |

The line I'm holding: fixes that close a **non-negotiable** (impersonation, unconsented
narration about another person) ship now; items the README already discloses as
Admin-SDK-blocked tradeoffs are left as documented residuals rather than papered over.

---

## AI safety — `checkNarrative` Unicode evasion  ·  FIXED

**Feature:** the prompt-injection backstop (`checkNarrative`).
**Dimension:** AI/LLM safety — a **non-negotiable** ("an attacker's commit message must
never make Pulse publish a narrative about someone else").
**Severity:** High.

### How it breaks
`checkNarrative`'s `names_another_member` rule matched member names against the raw model
output with no normalization — unlike `normaliseTitle`, which folds. Injection's cheapest
evasion is typographic: steer the model (via a commit message / PR title) to emit a member's
name with a **zero-width character** spliced in (`Mar<U+200B>cus`) or a **combining-mark**
variant (`Márcus`). Both render identically to a human but dodge the word match, so a
sentence naming someone else sails past the backstop and auto-publishes to 64 feeds.

### Repro (`UNIT`, red before fix)
`tests/unit/sense.test.ts` — two new tests: `Mar​cus broke the build` and
`Márcus broke the build` (member "Marcus"). Both returned `ok: true` before the fix.

### Root-cause lesson
A safety check that compares attacker-influenced text against a fixed vocabulary must
**canonicalise both sides first**, to the form a human actually reads — otherwise the
adversary picks a different byte sequence for the same glyph. The dedupe path already knew
this (`normaliseTitle` folds); the safety path, which matters more, didn't.

### Fix
`foldForMention` (`lib/sense.ts`): NFKD-decompose, strip combining marks, strip zero-width
and bidi controls, lowercase — applied to both the narrative and every member/actor token
before `mentions()`. Mirrors `normaliseTitle` but preserves word boundaries (which
`mentions` needs).

### Residual (documented)
Cross-script **homoglyphs** (Cyrillic `а` for Latin `a`) are not folded — that needs a
confusables table. NFKD does not equate them. Called out in the code comment; the
zero-width/combining classes are the ones a model realistically emits from injected text.
The `displayName` carve-out (4a) and first-name-only (4b) evasions remain as documented in
the triage table above.

### Guarded by
`tests/unit/sense.test.ts` (`UNIT`), 2 new tests.

---

## Test-suite growth

| Suite | Before | After |
|---|---|---|
| unit | 121 | 128 (+2 Unicode + concurrent additions) |
| rules | 92 | 102 (+10: id-squat, tombstones, actorName forgery) |
| integration | 0 | 5 (new project: items 1–4) |
| e2e | 49 | 49 (no regression from any fix) |

New `test:integration` script added to the gate so items 1–4 stay protected.

---

## Still fragile (read this last)

Two things I'd watch, honestly:

1. **Provenance is still trust-based at *create* time.** The rules now stop a peer
   impersonating your *name* and squatting your *ids*, but a signed-in member can still
   `addDoc` a task stamped `source: 'sensed'` with fabricated `evidence`, and can still put
   a victim's name in a pulse event's free-text `narrative`/`subject` (now attributed to the
   attacker, not the victim). Closing these needs a **server identity (Firebase Admin SDK)**
   so events and receipts are authored where a client can't forge them. This is the single
   dependency under the most-serious residuals (create-time forgery, the opt-out tombstone
   read, `/api/*` per-caller limits) — it's the real next investment, and it's a credential
   Nik has to create, not code I can write.

2. **The narration cache is a single slot per member, keyed per-PR.** `narrationCacheKey`
   is one string on `githubLinks/{uid}`, but each PR computes its own key, so shipping a
   second PR overwrites the first's key. Re-sensing the first PR then misses the cache — a
   paid model call for unchanged work and a risk of a duplicate announcement. It hasn't
   bitten because most members have ≤1 shipped PR today; it will as the cohort ships more.
   The fix is a per-work cache (a map or a `narratedWorkIds` set), not a scalar — a small,
   safe change I scoped but did not land this pass. **Recommend doing it before the pilot
   scales**, because it spends the ~$11 credit the whole narration budget rests on.
