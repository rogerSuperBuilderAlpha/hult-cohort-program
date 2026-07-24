# Relay 65 Spark Free-Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Relay 65 into a no-billing Firebase Spark release that deploys only Firestore rules/indexes and Hosting, while keeping the paperclip visibly disabled and preserving private-channel security.

**Architecture:** Retain the browser-to-Firebase Auth/Firestore path and the adapter abstraction. Introduce a configuration-enforced `attachmentsEnabled: false` release flag, replace file upload operations with deterministic adapter rejections, and remove Storage/Functions from the Hosting manifest. Existing historical local attachment rendering stays read-only; new Firestore attachment data is rejected by rules.

**Tech Stack:** Vanilla ES modules, Firebase Web Auth/Firestore SDK, Firestore Security Rules, Firebase Hosting, Node.js built-in test runner, Firebase Rules Unit Testing emulator package.

## Global Constraints

- Keep the root `npm test` dependency-free and runnable on Node.js 22+.
- Preserve separate public and member-only channel listeners and their private-channel authorization rules.
- Do not add a Storage SDK import, Cloud Functions deploy target, webhook rewrite, OAuth secret, or webhook secret to public configuration.
- Require all six public Firebase web fields in production configuration, including `storageBucket`.
- Keep the paperclip visible, `aria-disabled="true"`, keyboard reachable, and explanatory; it must not invoke a file picker.
- Do not delete `functions/` or `storage.rules`; mark them as deferred Blaze-upgrade source only.
- Do not commit in this workspace because it has no `.git` metadata. Apply the changes in the user’s repository checkout before committing there.

---

### Task 1: Establish Spark-core regression tests before the behavior changes

**Files:**
- Create: `tests/spark-free-core.test.mjs`
- Modify: `tests/config-validation.test.mjs`
- Modify: `tests/demo-adapter.test.mjs`
- Modify: `emulator/channel-rules-smoke.mjs`

**Interfaces:**
- Consumes: `validateRelayConfigSource(source)`, `FirebaseAdapter`, `DemoAdapter`, `firebase.json`, and `firestore.rules`.
- Produces: tests that establish the no-Storage/no-Functions release contract before implementation.

- [ ] **Step 1: Add the failing manifest and static-runtime test file**

Create `tests/spark-free-core.test.mjs` with bounded source reads. It must assert the final Spark deployment contract rather than just string-match a deploy command:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Spark release manifest excludes paid Firebase services and webhook routes', async () => {
  const firebase = JSON.parse(await read('firebase.json'));
  const rewrites = firebase.hosting.rewrites || [];
  const csp = firebase.hosting.headers
    .flatMap((entry) => entry.headers || [])
    .find((header) => header.key === 'Content-Security-Policy')?.value || '';

  assert.equal(firebase.storage, undefined);
  assert.equal(firebase.functions, undefined);
  assert.deepEqual(rewrites, [{ source: '**', destination: '/index.html' }]);
  assert.ok(!csp.includes('firebasestorage.googleapis.com'));
});

test('Spark release keeps a disabled paperclip without file upload plumbing', async () => {
  const [html, app, adapter] = await Promise.all([
    read('index.html'), read('src/app.js'), read('src/adapters/firebase.js')
  ]);

  assert.match(html, /data-action="attach-file"[^>]*aria-disabled="true"/);
  assert.ok(!html.includes('id="file-input"'));
  assert.match(app, /Attachments are unavailable in the free Firebase release\./);
  assert.ok(!app.includes('.uploadFile('));
  for (const forbidden of ['firebase-storage.js', 'getStorage(', 'uploadBytesResumable', 'getBlob(']) {
    assert.ok(!adapter.includes(forbidden), `Firebase adapter must not use ${forbidden}`);
  }
});
```

- [ ] **Step 2: Extend configuration fixtures to express the release flag**

Update `configSource()` in `tests/config-validation.test.mjs` so every valid fixture includes `attachmentsEnabled: false`. Add a test that rejects missing and enabled attachment configuration:

```js
test('Spark configuration explicitly disables attachments', () => {
  const enabled = validateRelayConfigSource(configSource({
    demoMode: false,
    extra: 'attachmentsEnabled: true'
  }));
  const missing = validateRelayConfigSource(`window.RELAY_CONFIG = {
    demoMode: false,
    firebase: ${JSON.stringify(productionFirebase)}
  };`);

  assert.equal(enabled.ok, false);
  assert.equal(missing.ok, false);
  assert.ok(enabled.errors.some((error) => error.includes('attachmentsEnabled')));
  assert.ok(missing.errors.some((error) => error.includes('attachmentsEnabled')));
});
```

- [ ] **Step 3: Add adapter guard tests**

In `tests/demo-adapter.test.mjs`, use its existing `MemoryStorage` setup to verify that the demo adapter rejects a synthetic upload without storing file data. In `tests/spark-free-core.test.mjs`, instantiate `FirebaseAdapter` without initialization and assert the same rejection:

```js
await assert.rejects(
  adapter.uploadFile({ name: 'proof.txt', type: 'text/plain', size: 5 }),
  /Attachments are unavailable in the free Firebase release\./
);
```

Do not initialize Firebase in this test; the method must reject before any network or SDK use.

- [ ] **Step 4: Extend the emulator with a negative attachment-write case**

Update `emulator/channel-rules-smoke.mjs` to import `addDoc`, give `public-room` `postingRoles: []`, and add this fifth test:

```js
test('denies a new message carrying an attachment payload', async () => {
  await assertFails(addDoc(collection(aliceDb, 'channels', 'public-room', 'messages'), {
    senderId: 'alice', senderName: 'Alice', senderHandle: 'alice', senderRole: 'member',
    content: 'This must not create an attachment.', signalType: 'message',
    attachment: { storagePath: 'channel-attachments/public-room/alice/proof.txt' },
    task: null, reactions: {}, threadCount: 0, clientCreatedAt: Date.now()
  }));
});
```

- [ ] **Step 5: Run the expected failing checks**

Run:

```bash
npm test
cd emulator && env PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npm run test:emulator && cd ..
```

Expected before implementation: root tests fail on the Spark manifest/config/static assertions, and the emulator’s new attachment-write test fails because the old rules allow it.

---

### Task 2: Implement the attachment-free runtime and Firestore guard

**Files:**
- Modify: `config.js`
- Modify: `config.example.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/app.js`
- Modify: `src/adapters/demo.js`
- Modify: `src/adapters/firebase.js`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes: `config.attachmentsEnabled === false`.
- Produces: a focusable disabled paperclip explanation, an attachment-free composer payload, storage-free adapters, and attachment-denying Firestore rules.

- [ ] **Step 1: Declare the release flag in both public config files**

Place this adjacent to `demoMode` in both config files and remove `maxUploadBytes`:

```js
attachmentsEnabled: false,
```

Keep all six Firebase fields, especially `storageBucket`, unchanged.

- [ ] **Step 2: Change the paperclip to an accessible unavailable control**

Replace the file-capable paperclip control and remove the hidden file input in `index.html`:

```html
<button class="is-unavailable" type="button" data-action="attach-file"
  aria-label="Attachments unavailable in the free Firebase release"
  aria-disabled="true" aria-describedby="attachment-unavailable">
  <span data-icon="paperclip"></span>
</button>
<span id="attachment-unavailable" class="sr-only">Attachments are unavailable in the free Firebase release.</span>
```

Add CSS that dims `.composer-tools button.is-unavailable`, changes its cursor to `not-allowed`, and preserves focus visibility. Do not use the native `disabled` attribute because the user must be able to focus/activate it to receive the explanation.

- [ ] **Step 3: Remove file selection and upload work from the app controller**

Make these focused changes in `src/app.js`:

```js
// Remove fileInput and pendingAttachment from the element/state maps.
if (!content && !state.pendingTask) return;
const payload = { content, signalType: elements.signalType.value, attachment: null, task: state.pendingTask };

case 'attach-file':
  return toast(
    'Attachments unavailable',
    'Attachments are unavailable in the free Firebase release.',
    'paperclip'
  );
```

Delete `handleFile()`, the file-input event listener, and all `state.pendingAttachment` transitions. Keep `attachment-preview` because it previews PM task cards. Update `renderAttachmentPreview()` and `remove-attachment` so they operate only on `state.pendingTask`.

Do not change `renderAttachment()`: it remains read-only rendering for direct local fixture URLs and safely displays old `storagePath` records as unavailable when the Firebase adapter has no resolver.

- [ ] **Step 4: Remove Storage from the Firebase adapter and make both upload methods reject**

In `src/adapters/firebase.js`:

```js
const [appModule, authModule, firestoreModule] = await Promise.all([
  import(`${base}/firebase-app.js`),
  import(`${base}/firebase-auth.js`),
  import(`${base}/firebase-firestore.js`)
]);
this.fb = { ...appModule, ...authModule, ...firestoreModule };
this.app = this.fb.initializeApp(this.config.firebase);
this.auth = this.fb.getAuth(this.app);
this.db = this.fb.getFirestore(this.app);
```

Delete `attachmentUrls`, `this.storage`, the Cloud Storage implementation of `uploadFile()`, and `getAttachmentUrl()`. Replace `uploadFile()` in both `FirebaseAdapter` and `DemoAdapter` with:

```js
async uploadFile() {
  throw new Error('Attachments are unavailable in the free Firebase release.');
}
```

`sendMessage()` continues to serialize `attachment: payload.attachment || null` so Firestore receives the explicit null accepted by the new rule.

- [ ] **Step 5: Deny attachment-bearing writes in Firestore rules**

Add a reusable helper near `validMessageCreate()`:

```rules
function hasNoAttachment(data) {
  return !data.keys().hasAny(['attachment']) || data.attachment == null;
}
```

Apply it to `validMessageCreate()` and both reply `allow create` expressions. Remove `attachment` from `ownContentUpdate()`’s `affectedKeys().hasOnly(...)` list so a regular member cannot alter an existing attachment field. Preserve `task` in that list.

- [ ] **Step 6: Run focused runtime/rule tests**

Run:

```bash
node --test tests/config-validation.test.mjs tests/spark-free-core.test.mjs tests/demo-adapter.test.mjs
cd emulator && env PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npm run test:emulator && cd ..
```

Expected after implementation: all focused tests pass, including the fifth emulator denial case.

---

### Task 3: Make the Firebase deployment manifest and root validator Spark-only

**Files:**
- Modify: `firebase.json`
- Modify: `scripts/config-validation.mjs`
- Modify: `scripts/validate.mjs`
- Modify: `tests/spark-free-core.test.mjs`

**Interfaces:**
- Consumes: `attachmentsEnabled: false`, a static Firebase Hosting configuration, and Firestore rule/index files.
- Produces: a manifest that cannot route or deploy paid services and a root validator that verifies that invariant.

- [ ] **Step 1: Remove paid targets and webhook rewrites from the manifest**

In `firebase.json`:

```json
"rewrites": [
  { "source": "**", "destination": "/index.html" }
]
```

Delete the two Function rewrites and the top-level `storage` and `functions` keys. Retain the top-level `firestore` key. Remove `https://firebasestorage.googleapis.com` from both the `img-src` and `connect-src` CSP directives.

- [ ] **Step 2: Enforce the explicit attachment flag in semantic config validation**

Add this check after the existing `demoMode` validation in `validateRelayConfig(config)`:

```js
if (config.attachmentsEnabled !== false) {
  errors.push('attachmentsEnabled must be explicitly false in the Firebase Spark release');
}
```

This makes the free release mode an evaluated property, not a source-text convention.

- [ ] **Step 3: Replace paid-service validator assertions with Spark invariants**

In `scripts/validate.mjs`, stop requiring or reading `storage.rules`, `functions/index.js`, and `functions/package.json`. Remove positive assertions for upload limits, protected Storage paths, HMAC code, and Function rewrites. Add checks equivalent to:

```js
const adapter = read('src/adapters/firebase.js');
const rewrites = firebaseJson.hosting?.rewrites || [];
const csp = firebaseJson.hosting?.headers
  ?.flatMap((entry) => entry.headers || [])
  .find((header) => header.key === 'Content-Security-Policy')?.value || '';

check(firebaseJson.storage === undefined && firebaseJson.functions === undefined, 'Spark release must not deploy Storage or Functions');
check(rewrites.length === 1 && rewrites[0].source === '**' && rewrites[0].destination === '/index.html', 'Spark Hosting must use only the SPA rewrite');
check(!csp.includes('firebasestorage.googleapis.com'), 'Spark Hosting CSP must not authorize Firebase Storage');
check(!adapter.includes('firebase-storage.js') && !adapter.includes('getStorage('), 'Firebase adapter must not initialize Storage in Spark release');
check(!index.includes('id="file-input"') && index.includes('aria-disabled="true"'), 'Spark composer must expose a disabled attachment affordance without a file input');
```

Retain validation of the Firestore channel indexes, CSP existence, both adapter classes, config secrets, and all existing privacy invariants.

- [ ] **Step 4: Run the full root suite**

Run:

```bash
npm test
```

Expected: the validator reports the updated required-file count and every root test passes. No `functions/` or `storage.rules` active-release assertion remains.

---

### Task 4: Rewrite release documentation around the no-billing path

**Files:**
- Modify: `README.md`
- Modify: `DEPLOYMENT.md`
- Modify: `START_HERE.md`
- Modify: `ARCHITECTURE.md`
- Modify: `SECURITY.md`
- Modify: `QA_REPORT.md`
- Modify: `PR_BODY.md`
- Modify: `SUBMISSION_CHECKLIST.md`
- Modify: `AGENTS.md`
- Modify: `emulator/README.md`
- Modify: `docs/superpowers/specs/2026-07-23-production-readiness-design.md`
- Modify: `docs/superpowers/plans/2026-07-23-production-readiness.md`

**Interfaces:**
- Consumes: the Spark manifest and no-billing deployment command.
- Produces: one consistent operator story: configure → validate → deploy Firestore rules/indexes/Hosting → first GitHub sign-in → bootstrap admin → production QA.

- [ ] **Step 1: Replace active paid-feature claims with Spark-core claims**

In all user-facing documents, state that this release has:

```text
Firebase Auth + Firestore + Hosting on Spark; attachments and inbound webhooks are deferred to a future Blaze upgrade.
```

Keep PM board links and task cards. Remove claims that signed webhook ingestion, protected uploads, Storage rules, Function secrets, or a Blaze plan are active release requirements.

- [ ] **Step 2: Make the deployment guide executable without billing**

`DEPLOYMENT.md` must direct the operator to create a Web app, enable Firestore in Production mode, enable GitHub Auth, configure the GitHub callback, save public web config, validate, and deploy:

```bash
npm test
cd emulator
npm install
npm run test:emulator
cd ..

npm install --global firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

Then retain the existing post-deployment first sign-in / UID / `members/{UID}` admin / `settings/workspace` bootstrap order. Add a clearly labeled future Blaze section that says restoring Storage and Functions requires restoring their manifest targets and webhook rewrites, installing Function dependencies, setting secrets, and running the combined deployment.

- [ ] **Step 3: Update evidence and submission checklist wording**

`QA_REPORT.md`, `PR_BODY.md`, and `SUBMISSION_CHECKLIST.md` must distinguish:

- completed local Spark-core tests;
- still-required live GitHub OAuth, deployed Firestore rules/indexes, two-account realtime/DM privacy, final URL, and load tests;
- intentionally unavailable attachments and incoming webhook delivery.

They must not present a missing webhook/attachment check as an unfinished requirement for this Spark release.

- [ ] **Step 4: Mark historical paid-release plans as superseded**

Add a short top-of-file note to the two previous production-readiness documents that their combined Storage/Functions deployment path is superseded by `2026-07-23-spark-free-core-design.md` for the active release. Do not delete their historical record.

- [ ] **Step 5: Validate documentation references**

Run:

```bash
rg -n "firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting|Blaze.*required|functions:secrets:set|/api/pm-webhook|/api/github-webhook" README.md DEPLOYMENT.md START_HERE.md ARCHITECTURE.md SECURITY.md QA_REPORT.md PR_BODY.md SUBMISSION_CHECKLIST.md AGENTS.md emulator/README.md
```

Expected: no active Spark-release instructions match; any remaining mention appears only in the explicitly labeled future-Blaze or historical-superseded context.

---

### Task 5: Complete release verification and prepare the Firebase Console handoff

**Files:**
- Modify if needed: `QA_REPORT.md`
- Modify if needed: `PR_BODY.md`

**Interfaces:**
- Consumes: completed root tests, emulator results, static manifest, and user-provided Firebase Web configuration later in the workflow.
- Produces: verified local release evidence and exact next Firebase Console actions without claiming a live deployment prematurely.

- [ ] **Step 1: Run all local verification commands**

Run:

```bash
npm test
cd emulator
env PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npm run test:emulator
cd ..
python3 -m http.server 4173
```

Verify in a browser at `http://localhost:4173/?demo=1` that the paperclip is visible, focusable, visually unavailable, and explains the Spark restriction; sending an ordinary message and attaching a PM task still work.

- [ ] **Step 2: Perform a requirements-to-evidence audit**

Confirm from current files and command output:

1. no Storage SDK import or Storage deployment manifest target;
2. no Function deployment manifest target or webhook rewrite;
3. disabled paperclip has no file picker/event path;
4. adapters reject unexpected upload calls;
5. direct attachment-bearing Firestore write is denied in the Emulator;
6. public and private authorized channel queries remain allowed, while unrelated private and unrestricted queries remain denied;
7. docs use only the Spark deployment command.

- [ ] **Step 3: Give the operator the exact next Console actions**

After local verification, tell the operator to stay on Spark, add the Firebase Web app, enter only the public web config into `config.js`, create Firestore in Production mode, enable the GitHub provider, configure the callback `https://vera-ae3af.firebaseapp.com/__/auth/handler`, run the Spark deploy command, then sign in and bootstrap the first admin. Do not attempt billing, Storage provisioning, Function secret creation, or a production deploy without the user’s Firebase configuration and explicit authority.
