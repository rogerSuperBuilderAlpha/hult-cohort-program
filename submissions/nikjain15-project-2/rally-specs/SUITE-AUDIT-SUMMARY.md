# Suite audit — 2-minute summary (Pulse + Rally↔Pulse)

**What was audited.** Pulse on its own (security, privacy, correctness, DB/cost, resilience,
UX/voice) and the Rally↔Pulse seam (one identity across two backends, shared memory/history,
agent-to-agent dispatch). Method: parallel dimension auditors → an adversarial pass that tried to
*refute* each finding → fix → guard with a test. Rally had its own individual audit already; this
covered Pulse-individual + the cross-app suite.

**What broke — and what's fixed.**
- **Critical: the cross-app identity key was forgeable.** A member could set their `handle` to a
  teammate's and then read, forge tasks under, or *erase* that teammate's shared context across both
  apps. Fixed: the handle is now frozen once set (rules), guarded by tests; the belt-and-braces
  uniqueness registry is documented as the follow-up.
- **High: a real misconfig 500'd the bus routes** (the same bug that caused a live 500 this session)
  — now degrades to 503.
- **High: the broker would silently die in prod** for lack of a Firestore composite index — index
  added.
- **High: task claiming could starve a user forever** (contract drift vs Rally) — re-aligned to
  Rally's fair, ordered claim; **High: "right to be forgotten" left tasks behind** — now complete.
- **High (ethics): the broker's one public post now requires explicit, disclosed consent.** It used
  to name a "stuck" member to the whole cohort when they privately marked a recipe helpful; now the
  private credit and the public thank-you are separate, and nothing names a person without their
  deliberate opt-in ("never punish the quiet").
- Plus best-effort bus error handling and voice fixes.
- **One high held back on purpose, documented:** a feed self-rename impersonation — the airtight fix
  risks the sign-in path and pinned tests, so it ships with a written fix path rather than a rushed
  change.

**Scale.** Pulse holds to **5k synthetic members** with board loads at p95 ≤75 ms; no functional
ceiling hit (the ≥1k bar is cleared comfortably). The only O(cohort) cost is a *daily* broker scan
(~25k reads at 5k ≈ a fraction of a cent), with a quantified 37% index win documented.

**How it stays fixed.** Three one-command regression suites, all emulator-only with synthetic
`zz-test-*` data: `npm run test:drift` (contract identical across both apps — behavioral, not a
brittle source diff), `npm run test:cross-app` (dispatch lifecycle + every adversarial case, erasure
completeness, isolation), and `npm run test:scale`. Every fix above ships with a guarding test.

**Health.** Pulse gate green — rules 127/127, integration 37/37, unit 272/272, typecheck + lint
clean. Neither app's own gate regressed.

**Two things still on Nik (not code):** confirm the `cohort-context` bus has its deny-all-client
rules deployed; deploy the new Firestore indexes (`firebase deploy --only firestore:indexes`).

Full detail: `PULSE-AUDIT-REPORT.md`, `CROSS-APP-AUDIT-REPORT.md`.
