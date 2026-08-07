# Production Readiness Implementation Plan

> **Superseded for the active release (July 23, 2026).** This historical plan describes the earlier Blaze path with Storage, Functions, webhook secrets, and combined Hosting deployment. The active Firebase Spark core plan is [2026-07-23-spark-free-core-implementation.md](2026-07-23-spark-free-core-implementation.md); it deploys only Firestore rules/indexes and Hosting while attachments and inbound webhooks remain deferred.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Relay 65's channel queries, configuration validation, deployment path, and webhook release safe for production.

**Architecture:** Preserve private-channel authorization with separate public and member-only Firestore listeners, then merge their snapshots in the adapter. Keep the root test suite dependency-free by testing adapter behavior with Firestore-function doubles and configuration fixtures; keep the real rules smoke test in a separate emulator harness.

**Tech Stack:** Vanilla ES modules, Firebase Web SDK API surface, Firestore Rules v2, Node.js 22+, Firebase Emulator Suite.

## Global Constraints

- Preserve participant-only DM access and do not add a staff/admin DM read bypass.
- Do not put OAuth, Admin SDK, service-account, or webhook secrets in `config.js`.
- Keep root `npm test` dependency-free.
- First Hosting deployment must include Functions because `firebase.json` has function rewrites.
- Every channel must carry a numeric `sort` value.

---

### Task 1: Align channel reads, seeding, rules, and indexes

**Files:**
- Modify: `src/adapters/firebase.js`
- Modify: `firestore.rules`
- Modify: `firestore.indexes.json`
- Create: `tests/firebase-channels.test.mjs`

**Interfaces:**
- Consumes: Firebase `collection`, `query`, `where`, `orderBy`, `limit`, `onSnapshot`, and `getDocs` functions.
- Produces: `subscribeChannels(callback)` with one combined cleanup function and a public-only seed query.

- [ ] Add a failing adapter test using function doubles that captures both `query()` calls and `onSnapshot()` callbacks.
- [ ] Assert public and private snapshots merge by ID, exclude archived items, order numerically by `sort`, and call both unsubscribe functions.
- [ ] Add the two channel composite index definitions.
- [ ] Add `canReadChannelData(channel)` and use `resource.data` for `/channels/{channelId}` reads; retain parent-document reads for nested messages/replies.
- [ ] Require numeric `sort` on channel create and preserve it on non-staff updates.
- [ ] Implement the two listeners and the constrained `where('type', '==', 'public'), limit(1)` seed query.
- [ ] Run `npm test` and confirm channel behavior passes.

### Task 2: Validate demo and production configuration safely

**Files:**
- Create: `scripts/config-validation.mjs`
- Modify: `scripts/validate.mjs`
- Create: `tests/config-validation.test.mjs`

**Interfaces:**
- Produces: `parseRelayConfig(source)` and `validateRelayConfig(config)` returning an array of validation errors.
- Consumes: a JavaScript source string that assigns `window.RELAY_CONFIG`.

- [ ] Add tests for the shipped demo fixture, a complete production fixture with an `AIza` API key, incomplete production fields, placeholders, and forbidden secrets.
- [ ] Run the new test file and confirm the incomplete/secret fixtures fail only through returned validation errors.
- [ ] Evaluate configuration in an isolated VM context, validate mode-specific fields, and remove the false-positive Firebase key expression.
- [ ] Make the root validator report configuration errors from the shared helper.
- [ ] Run `npm test` and confirm the full dependency-free suite passes.

### Task 3: Make the release path and documentation match deployed behavior

**Files:**
- Modify: `DEPLOYMENT.md`
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Modify: `QA_REPORT.md`
- Modify: `PR_BODY.md`
- Modify: `SUBMISSION_CHECKLIST.md`
- Create: `emulator/package.json`
- Create: `emulator/channel-rules-smoke.mjs`
- Create: `emulator/README.md`

**Interfaces:**
- Consumes: Firebase Emulator Suite, `@firebase/rules-unit-testing`, and `firebase` installed only under `emulator/`.
- Produces: `npm run smoke` inside `emulator/`, which tests public query allow, member-only query allow, unauthorized-private exclusion, and unrestricted-query denial.

- [ ] Document the full-webhook first release: install Functions dependencies, set both secrets, then deploy Functions and Hosting together.
- [ ] Move core rule/index/Storage/Hosting deployment before first GitHub login and admin bootstrap.
- [ ] Add an emulator package without adding root dependencies.
- [ ] Write the rules smoke cases using authenticated test environments and loaded local Firestore rules.
- [ ] Add exact commands to install emulator tooling and run the smoke test.
- [ ] Update QA/PR artifacts to distinguish implemented checks from credential-dependent production evidence.

### Task 4: Final verification and handoff

**Files:**
- Verify all files above.

- [ ] Run `npm test`.
- [ ] Install emulator-only dependencies and run the Firestore Emulator smoke harness.
- [ ] Inspect modified files and confirm no real secret is present.
- [ ] Report changed files, results, remaining Firebase-console inputs, and exact deployment commands.
