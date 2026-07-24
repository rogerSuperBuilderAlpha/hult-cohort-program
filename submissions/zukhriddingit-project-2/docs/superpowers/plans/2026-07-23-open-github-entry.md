# Open GitHub Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve frictionless GitHub-only entry with no administrator approval and prevent future deployments from regressing it.

**Architecture:** Runtime enrollment remains in `FirebaseAdapter.checkMembership()`: an existing `settings/workspace` document with `accessMode: "open"` allows a GitHub-authenticated caller to create its own active `member` document. The plan adds an emulator assertion for that rule path and updates deployment documentation to describe the neutral workspace setup rather than an administrator bootstrap.

**Tech Stack:** Firebase Authentication (GitHub), Cloud Firestore Security Rules, Firebase Hosting, Node.js test runner, Firestore Emulator.

## Global Constraints

- Keep Firebase Spark core: deploy only Firestore rules/indexes and Hosting; do not add Storage, Functions, webhook routes, secrets, or billing.
- Keep private-channel membership checks and participant-only DM rules unchanged.
- Keep root `npm test` dependency-free.
- Use `accessMode: "open"`; every automatic join must create `role: "member"` and `active: true`.

---

### Task 1: Prove open GitHub enrollment in the Firestore Emulator

**Files:**
- Modify: `emulator/channel-rules-smoke.mjs`
- Modify: `emulator/README.md`

**Interfaces:**
- Consumes: `openRegistration()` in `firestore.rules`, which reads `settings/workspace.accessMode`.
- Produces: an emulator test proving one fresh GitHub identity can create only `members/{itsOwnUid}` after the neutral workspace is seeded.

- [ ] **Step 1: Add the neutral workspace fixture**

Add this write inside the existing `withSecurityRulesDisabled()` fixture `Promise.all`:

```js
setDoc(doc(db, 'settings', 'workspace'), { accessMode: 'open', cohortCapacity: 65, workspaceName: 'Hult Cohort' }),
```

- [ ] **Step 2: Add the passing GitHub self-enrollment test**

Add this test after the fixture-dependent channel tests:

```js
test('allows a fresh GitHub user to self-enrol in an open workspace', async () => {
  const charlieDb = testEnvironment.authenticatedContext('charlie', {
    firebase: { sign_in_provider: 'github.com' }
  }).firestore();

  await assertSucceeds(setDoc(doc(charlieDb, 'members', 'charlie'), {
    uid: 'charlie', active: true, role: 'member'
  }));
  await assertFails(setDoc(doc(charlieDb, 'members', 'alice'), {
    uid: 'alice', active: true, role: 'member'
  }));
});
```

- [ ] **Step 3: Add the non-GitHub denial in the same test**

Append this assertion to the test:

```js
  const passwordDb = testEnvironment.authenticatedContext('password-user', {
    firebase: { sign_in_provider: 'password' }
  }).firestore();
  await assertFails(setDoc(doc(passwordDb, 'members', 'password-user'), {
    uid: 'password-user', active: true, role: 'member'
  }));
```

- [ ] **Step 4: Run the isolated Emulator suite**

Run:

```bash
cd emulator
npm run test:emulator
```

Expected: all existing channel/privacy tests and the new GitHub enrollment test pass. If Java is unavailable, report the exact local runtime prerequisite rather than claiming the emulator ran.

- [ ] **Step 5: Update the Emulator guide**

Add `settings/workspace.accessMode == "open"` and the GitHub-only automatic-member test to the `What it proves` list in `emulator/README.md`.

### Task 2: Align production documentation with the no-admin model

**Files:**
- Modify: `README.md`
- Modify: `DEPLOYMENT.md`
- Modify: `ARCHITECTURE.md`
- Modify: `SECURITY.md`
- Modify: `PR_BODY.md`
- Modify: `SUBMISSION_CHECKLIST.md`

**Interfaces:**
- Consumes: the deployed `settings/workspace` document and the existing `FirebaseAdapter.checkMembership()` automatic-join path.
- Produces: one unambiguous, Spark-compatible setup sequence with no administrator approval or bootstrap account.

- [ ] **Step 1: Replace administrator-bootstrap copy**

Describe this exact sequence everywhere deployment is documented:

```text
1. Deploy Firestore rules/indexes and Hosting.
2. In Firestore Console, create settings/workspace with accessMode "open", cohortCapacity 65, and workspaceName "Hult Cohort".
3. Sign in with GitHub. Relay creates an active role "member" document automatically.
4. Seed shared public channels through the member UI. Do not set staff-only posting roles.
```

- [ ] **Step 2: State the admission trade-off plainly**

Add a security/deployment note: `accessMode: "open"` admits every GitHub-authenticated account; it is not a cohort roster allowlist. Private channels, DMs, and attachment restrictions remain unchanged.

- [ ] **Step 3: Update submission QA language**

Replace first-admin requirements with checks for an active normal member, no residual access request, six public starter channels, and a second GitHub account auto-enrollment smoke test.

### Task 3: Validate the live release and repository checks

**Files:**
- Verify only: deployed Firestore `settings/workspace`, `members/{uid}`, `channels`, and `access_requests`
- Verify only: `firebase.json`, `firestore.rules`, `config.js`

**Interfaces:**
- Consumes: Firebase Console state and the active Hosting build.
- Produces: evidence that no approval queue or administrator profile is necessary for entry.

- [ ] **Step 1: Inspect live Firestore documents**

Verify:

```text
settings/workspace.accessMode == "open"
members/{signedInUid}.active == true
members/{signedInUid}.role == "member"
access_requests/{signedInUid} does not exist
channels has announcements, general, ship-room, reviews, help-desk, random
```

- [ ] **Step 2: Verify the signed-in app state**

Open `https://vera-ae3af.web.app/` while signed in with GitHub. Expected: the workspace appears directly, the pending screen is hidden, and the six channels are visible.

- [ ] **Step 3: Run root validation**

Run:

```bash
npm test
```

Expected: `Relay 65 validation passed` and `23` passing root tests (or the updated higher count after adding root coverage).

- [ ] **Step 4: Record any external prerequisite accurately**

If `npm run test:emulator` cannot start because Java is missing, record that as a local validation limitation. Do not alter production Firebase configuration, rules, or the Spark deployment to work around it.
