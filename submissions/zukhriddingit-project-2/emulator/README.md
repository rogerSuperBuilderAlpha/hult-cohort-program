# Relay 65 Firestore Emulator smoke test

This standalone package verifies the channel-listing security boundary against the Firestore Emulator. It intentionally does not add packages to the dependency-free root project.

## What it proves

- an active member can list public channels using `where("type", "==", "public")` plus `orderBy("sort", "asc")`;
- an active member can list channels where their UID appears in `memberIds` using `array-contains` plus the same ordering;
- a private channel belonging only to another user is absent from the member query and cannot be fetched directly;
- non-members cannot read private-channel messages or replies;
- an unrestricted `channels` collection query is denied.
- a normal member is denied a message write in `#announcements`, while a `staff` profile can publish there;
- a fresh GitHub-authenticated user self-enrols as a normal member only while `settings/workspace.accessMode` is `"open"`; request-mode and missing-workspace attempts are denied, as are cross-user creation, self-promotion, self-deactivation, normal-member workspace writes, and non-GitHub identities.
- privileged third-party `staff` and `admin` profiles still cannot read a private channel they do not belong to or a participant-only DM.
- a direct channel-message create with a non-null attachment payload is denied.

The fixture gives every channel a numeric `sort` value. That matches the production contract: both public and future private channel documents need numeric ordering fields, because each listener orders by `sort`.

## Run before production

From the repository root:

```bash
cd emulator
npm install
npm run test:emulator
cd ..
```

`test:emulator` starts a disposable Firestore Emulator with the repository's `firebase.json` and `firestore.rules`, runs the smoke test, and shuts the emulator down. It uses the demo project ID `demo-relay65-channel-rules`, so it cannot contact a production Firebase project.

Requirements: Node.js 22+, Java 21+ for current Firestore Emulator releases, and network access on the first `npm install`/emulator download. The package-local Firebase CLI is used; a global CLI is not required for this test.

The final case uses a public channel with `postingRoles: []`, so the denial proves the attachment guard rather than a posting-permission failure. It imports `addDoc` directly and does not alter the channel-privacy cases.

The announcement fixture uses `postingRoles: ["staff"]`: the paired normal-member denial and staff success prove the role constraint without turning the staff role into a private-channel or DM read bypass.

The Emulator verifies authorization behavior but does not enforce compound-index requirements. Deploy `firestore.indexes.json` with production and confirm both `channels` indexes are Ready in Firebase Console before the production smoke test.

For the Firebase Spark core production sequence—GitHub OAuth, rules/indexes/Hosting deployment, neutral open-workspace setup, and two-account QA—follow [../DEPLOYMENT.md](../DEPLOYMENT.md). Attachments and incoming webhooks are intentionally deferred; do not install Function dependencies or provision Storage for this release.
