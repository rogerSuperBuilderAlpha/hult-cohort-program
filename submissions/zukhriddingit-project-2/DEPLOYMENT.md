# Relay 65 Spark deployment

Relay 65's active production profile is a no-billing Firebase **Spark core** release:

- Firebase Authentication with GitHub;
- Cloud Firestore for realtime channels, private channels, DMs, threads, and notifications;
- Firebase Hosting for the static app.

Attachments and incoming PM/GitHub webhooks are intentionally unavailable in this release. The paperclip stays visible and explains the limit, while PM board links and task cards continue to work. Do not provision Cloud Storage, install Function dependencies, create Function secrets, or enable billing for this deployment.

The release order is important: configure and validate first, deploy Firestore rules/indexes and Hosting, then create the neutral open-workspace document before GitHub users join.

## Before you start

You need:

- a Firebase project on the Spark plan;
- a GitHub account that can create an OAuth App;
- Node.js 22+, Java 21+ for the Firestore Emulator, and the Firebase CLI;
- the winning PM platform name, base URL, and cohort-board URL.

Never put a GitHub OAuth client secret, Firebase Admin/service-account key, private key, personal access token, or future webhook secret in `config.js`. Firebase web-app configuration is public browser configuration; access control belongs in Authentication and deployed Firestore rules.

## 1. Configure Firebase Spark core

1. Create or select the Firebase project. Leave it on the **Spark** plan.
2. Add a **Web app** in Project settings and copy its browser configuration.
3. Enable **Cloud Firestore** in Production mode.
4. Enable **Authentication** and **Hosting**.
5. Do not enable Cloud Storage or Cloud Functions for this release.

Create the local public runtime configuration:

```bash
cp config.example.js config.js
```

Replace every `YOUR_...` value. The production fields must be complete and non-placeholder:

```js
demoMode: false,
attachmentsEnabled: false,
accessMode: "open", // only used by staff starter seeding; Firestore settings/workspace controls live enrollment
firebase: {
  apiKey: "AIza...",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
},
pmPlatform: {
  name: "Winning PM platform name",
  baseUrl: "https://YOUR_PM_PLATFORM_URL",
  boardUrl: "https://YOUR_COHORT_BOARD_URL"
}
```

A normal Firebase browser `AIza…` API key is expected here. `storageBucket` remains a normal Firebase Web identifier even though Spark core does not initialize or deploy Storage.

## 2. Configure GitHub OAuth

### In GitHub

1. Open **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Application name** to `Relay 65`.
3. Set **Homepage URL** to the predictable Hosting URL, such as `https://YOUR_PROJECT_ID.web.app`.
4. Set **Authorization callback URL** exactly to:

```text
https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler
```

5. Create the app and generate a client secret.

### In Firebase Authentication

1. Open **Authentication → Sign-in method** and enable **GitHub**.
2. Paste the GitHub OAuth Client ID and Client Secret into Firebase. Do not copy the secret into this repository.
3. Under **Authentication → Settings → Authorized domains**, add `YOUR_PROJECT_ID.web.app`, `YOUR_PROJECT_ID.firebaseapp.com`, and any final custom domain.

Relay requests `read:user` and `user:email` to display the cohort member’s GitHub handle and retrieve an available verified email.

## 3. Validate before deploying

Run the dependency-free root checks after saving production `config.js`:

```bash
npm test
```

The validator evaluates `window.RELAY_CONFIG`. In production mode it requires complete public Firebase browser configuration and an explicit `attachmentsEnabled: false`; it rejects placeholders and real secrets. Demo mode permits blank Firebase fields. It does not require replacing the real config with a test fixture.

Run the Firestore Rules smoke test before production. It keeps Emulator dependencies inside `emulator/`, leaving the root test suite dependency-free:

```bash
cd emulator
npm install
npm run test:emulator
cd ..
```

The smoke suite must show that both channel queries are allowed, unrelated private roots and descendants are denied, an unrestricted query is denied, GitHub self-enrollment works only while `settings/workspace.accessMode` is `"open"`, a normal member is denied while staff can post in `#announcements`, third-party staff/admin profiles cannot read participant-only DMs, and a direct attachment payload is denied. See [emulator/README.md](emulator/README.md) for scope and limitations.

## 4. Deploy Spark core

Connect the Firebase CLI to the intended project:

```bash
npm install --global firebase-tools
firebase login
firebase use --add
```

Deploy the complete Spark release:

```bash
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

Confirm the deployment succeeds, both `channels` indexes become **Ready**, and the GitHub OAuth App homepage/authorized domains match the deployed HTTPS URL. The required channel indexes are:

- `type` ascending, then `sort` ascending;
- `memberIds` array-contains, then `sort` ascending.

## 5. Enable global GitHub entry and staff-only announcements

In Firestore Console, create the neutral `settings/workspace` document before anyone joins:

| Field | Type | Value |
|---|---|---|
| `accessMode` | string | `open` |
| `cohortCapacity` | number | `65` |
| `workspaceName` | string | `Hult Cohort` |

Open `https://YOUR_PROJECT_ID.web.app` and sign in with GitHub. Relay automatically creates `members/{UID}` with `active: true` and `role: "member"`; no approval record or access-approval administrator is required. Create the shared public channels through the member UI. Then, in Firestore Console, change the chosen existing owner profile to `role: "staff"` and set the channel document whose `name` is `announcements` to `postingRoles: ["staff"]`. Leave all other shared rooms at **Everyone can post**. Every channel, including future private channels, requires a numeric `sort` value so it participates in the ordered listeners.

`accessMode: "open"` deliberately admits every GitHub-authenticated account. It is a frictionless peer-review policy, not a cohort allowlist. This does not change private-channel membership checks or participant-only DM rules.

## 6. Spark production smoke test and submission

Use two browser profiles plus a third account for the DM-isolation check:

- [ ] GitHub sign-in succeeds on the final HTTPS domain.
- [ ] Both users appear in the member directory.
- [ ] A channel message, thread reply, reaction, and mention arrive in the second browser without refresh.
- [ ] A 1:1 DM is visible to its two participants and is denied to the third account.
- [ ] The paperclip is visible, focusable, and explains: “Attachments are unavailable in the free Firebase release.” No file picker opens.
- [ ] A PM board link and task card open the configured winning platform.
- [ ] A regular member can post in shared seed channels other than `#announcements`; that member is denied in `#announcements`, while the designated staff profile can post there. Private-channel membership and DM isolation still hold.
- [ ] Mobile works at 390 × 844 and the command palette works with `Ctrl/⌘ + K`.
- [ ] The 15-client burst plan in [LOAD_TEST.md](LOAD_TEST.md) passes.

Record the final evidence in [QA_REPORT.md](QA_REPORT.md), replace placeholders in [PR_BODY.md](PR_BODY.md), and complete [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md).

## Future Blaze upgrade — not part of this release

The repository preserves `storage.rules` and `functions/` as upgrade source, but they are intentionally inactive on Spark. If attachments or inbound webhooks become a product requirement later, make a deliberate billing-backed upgrade:

1. Enable and test Storage, restore the Storage target and Storage origin policy, then change `attachmentsEnabled` only after the UI, adapters, and rules have been re-verified.
2. Restore the Functions target and the `/api/pm-webhook` and `/api/github-webhook` Hosting rewrites together.
3. Install Function dependencies, create the webhook secrets in Firebase, and test signature handling.
4. Deploy Storage rules, Functions, and Hosting together; only then configure upstream senders.

Do not apply any of those steps to the Spark deployment above. A partial restoration would leave UI routes or paid services in an unsafe or misleading state.

## Troubleshooting

**`auth/unauthorized-domain`** — add the exact host under Firebase Authentication authorized domains.

**`auth/internal-error` before a GitHub consent window opens** — confirm Hosting's CSP still allows `https://apis.google.com` under `script-src`; Firebase Auth uses that helper to initialize its cross-origin auth iframe. Keep the existing `frame-src https://*.firebaseapp.com` allowance.

**`auth/api-key-not-valid` after a configuration fix** — hard-reload the final domain once. Relay serves `config.js` with `Cache-Control: no-store`, a release query, and a network-first service-worker path so deployed Firebase values replace an older cached placeholder configuration.

**GitHub callback mismatch** — the callback must use the Firebase Auth domain and end in `/__/auth/handler`; it is not the app root.

**A signed-in user sees the pending screen** — `settings/workspace` is missing or its `accessMode` is not `"open"`. Create or correct the neutral workspace document, then use **Recheck access**.

**Firestore asks for an index** — deploy `firestore.indexes.json` and wait for both channel indexes to become Ready. The Emulator does not enforce production compound-index requirements.
