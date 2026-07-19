# The cross-app suite — one product, many apps

**The thesis:** a cohort doesn't want five disconnected tools — it wants one product that happens to
have many surfaces. Rally (comms + recognition) and Pulse (the PM board) already share **one
identity, one memory, and agents that talk to each other** over the shared-context bus. This is the
suite's main selling point: each app is useful alone, but together they **compound** — and any new
app plugs into the same seam for free.

The bus is a dedicated Firebase project (`cohort-context`), keyed by the GitHub handle (a **frozen,
write-once** identity so it can never be repointed), with deny-all-client rules — every app reads and
writes it only through the Admin SDK. The contract is shared and **behaviorally drift-guarded**
(`contract-golden` in both apps), so the apps can evolve independently without silently breaking
sharing.

---

## Live today (Rally ↔ Pulse)

- **Shared memory + activity history.** A note saved in Pulse ("I'm on the auth refactor") shows up
  in Rally's memory view tagged `pulse`, and vice-versa. The assistant in either app carries one
  history — data-framed as untrusted context, never instructions.
- **Agent-to-agent dispatch.** Rally's assistant can hand a task to Pulse's agent ("ask Pulse to
  summarize my week"); it lands in Pulse's inbox, completes, and reports back on the bus. Claims are
  fair (per-handle, ordered), addressing-isolated, and worked exactly once.
- **Privacy by construction.** Identity is derived from the verified ID token (never a request
  body); per-handle isolation is tested with two writers; and **right-to-erasure is suite-wide** —
  one erase clears memory **and** activity **and** agent tasks everywhere.
- **Answer-only inbox posture.** A task another app dispatches runs the receiving assistant in
  read-only mode — it can summarize the claiming user's own data, never mutate it.

---

## What we're building next — the cross-app use cases

Concrete, high-value flows the seam unlocks. Each reuses the existing bus primitives (shared memory,
activity, dispatch, one identity) — no brittle per-pair integrations.

1. **Reputation that travels.** A peer-confirmed recognition in Rally ("Grace unblocked me") becomes
   a durable, un-gameable signal on the bus that Pulse can surface — the person who *helps* is
   visible where the *work* is planned. Recognition stops being a chat nicety and becomes cohort
   reputation, still peer-confirmed and never a public shame board.

2. **Commitments ↔ board cards, two-way.** "I'll open the PR by Friday" in Rally already becomes a
   tracked task; next it round-trips with Pulse's board: the card and the commitment share one
   state, closing either updates both, and a card that goes *blocked* in Pulse pings the original
   Rally thread — the promise and the plan stay in sync without anyone re-typing.

3. **Ask across apps, in plain language.** From Rally: "what does my week look like?" dispatches to
   Pulse's agent, which reads the board and answers inside Rally. From Pulse: "who helped me ship
   this?" dispatches to Rally. The user never context-switches; the right app answers.

4. **A standup that writes itself.** Each morning the agents gather Rally recognitions + kept
   commitments and Pulse progress into one cross-app brief — "here's what moved, here's who helped" —
   posted where the cohort already is. Zero manual status.

5. **Kind, context-aware teammate-finding.** Rally's "find a teammate who can help with X" is
   enriched by Pulse workload signals (who has slack, who's heads-down) so a request lands with
   someone who can actually help — surfaced kindly, never as a "who's behind" list.

6. **One consent, one forget, across everything.** A single privacy action already erases a person
   everywhere; next, a single **consent** grant (opt-in to cross-app sharing) governs the whole
   suite, with a per-app provenance trail the user can inspect.

7. **New apps join for free.** Any future cohort app that implements the same contract instantly
   shares memory and can dispatch/receive tasks — the drift guard keeps everyone honest. The suite
   is **extensible by construction**, not by N² integrations.

---

## Why the seam is the moat

- **One identity** — a frozen GitHub handle; no ambiguity about who a note or task belongs to.
- **One contract, drift-guarded** — apps evolve independently without breaking sharing (a source
  diff gives false positives, so the guard is behavioral and pinned in both apps).
- **Agents as the integration layer** — a task bus, not bespoke per-pair APIs, so adding the Nth app
  is O(1), not O(N).
- **Privacy-first** — server-only bus, per-handle isolation, data-minimized notes, complete
  suite-wide erasure, and read-only cross-app execution.

Each app earns its keep alone. The bus is what turns a folder of submissions into **a cohort
operating system**.

_See also: [`CROSS-APP-AUDIT-REPORT.md`](CROSS-APP-AUDIT-REPORT.md) (the seam, audited) and
[`SUITE-AUDIT-SUMMARY.md`](SUITE-AUDIT-SUMMARY.md)._
