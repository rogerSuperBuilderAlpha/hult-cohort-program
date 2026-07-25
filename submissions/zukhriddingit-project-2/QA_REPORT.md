# Relay 65 QA report

## Release candidate

- App: Relay 65
- Owner: `zukhriddingit`
- Release profile: Firebase Spark core — Authentication, Firestore, and Hosting
- Runtime mode: deployed Firebase production (`config.js` has `demoMode: false`); local demo remains available at `?demo=1`
- Production mode: complete public Firebase browser configuration is present
- Intentionally deferred: protected file attachments and incoming PM/GitHub webhook delivery

## Automated validation

Run the dependency-free root suite after saving the production `config.js`:

```bash
npm test
```

**Result: 24/24 tests passed** on July 23, 2026. The root validator also passed: **24 required files, security/config checks, and JavaScript syntax**.

The suite evaluates separate demo and complete-production configuration fixtures without replacing the checked-in runtime configuration. It checks:

- required active-release files and JavaScript syntax;
- evaluated demo/production configuration fixtures, placeholders, real-secret detection, and the explicit `attachmentsEnabled: false` Spark flag;
- core channel, DM, thread, reaction, mention, notification, search, report, and persistence behavior in the demo adapter;
- participant-only DM rule structure and dual public/member channel-listener behavior;
- channel merging, deduplication, archived-channel filtering, listener cleanup, numeric ordered indexes, and constrained public-channel seeding;
- the Spark manifest: no Storage/Functions deploy target, no webhook rewrite, no Storage SDK initialization, and a disabled attachment affordance without a file picker;
- adapter guards and rule restrictions that reject a new attachment payload.

Record the actual command output with the submission evidence. Do not claim a production configuration or deployment has been tested until it has actually been run.

## Browser smoke tests

A fresh Chromium browser context was previously served from the included local HTTP command. Service-worker use was blocked by the test harness so every check loaded the current source instead of a cached shell.

### Desktop — 1440 × 960

Recorded baseline checks:

- HTTP response `200`;
- clean entry target is `#ship-room`;
- six channels and six seeded messages render;
- workspace header, channel sidebar, icon rail, context panel, and composer are visible;
- a new async signal sends and renders without refresh;
- `Ctrl + K` opens the command palette and finds `#reviews`;
- no page-level JavaScript errors.

Screenshot: `assets/relay65-app-desktop.png`

### Mobile — 390 × 844

Recorded baseline checks:

- clean entry target is `#ship-room`;
- mobile header, composer, and five-item bottom navigation render;
- workspace drawer starts off-canvas, opens to expose channels, and closes again;
- no page-level or console errors.

Screenshot: `assets/relay65-app-mobile.png`

For the Spark release, additionally verify that the paperclip remains visible and keyboard reachable, announces “Attachments are unavailable in the free Firebase release.”, and never opens a file picker. Confirm ordinary messaging and PM task-card linking still work.

## Required pre-production Emulator check

The root suite does not start Firebase emulators or add dependencies to the root package. Before deployment, run:

```bash
cd emulator
npm install
npm run test:emulator
cd ..
```

This Firestore Rules smoke test now covers these boundaries:

- a public `type == "public"` ordered query is allowed;
- a `memberIds array-contains <UID>` ordered query is allowed;
- another member's private channel is omitted from the result and denied when fetched directly;
- an unrestricted `channels` collection query is denied;
- a normal member is denied a write in `#announcements`, while a `staff` profile can post there;
- a GitHub user self-enrols only while the Firestore workspace is `open`, cannot self-promote or edit workspace settings, and a non-GitHub identity is denied;
- private-channel messages/replies and a participant-only DM (including its nested message/reply) are denied to nonparticipants, even to `staff` and `admin` identities;
- a direct channel-message create carrying a non-null attachment payload is denied.

The Emulator does not validate compound-index building; deploy `firestore.indexes.json` and wait for both channel indexes to become Ready in Firebase Console.

### Local result

**Passed 8/8** on July 23, 2026 using the disposable `demo-relay65-channel-rules` project:

- public ordered channel query allowed;
- member-only ordered channel query allowed;
- unrelated private channel excluded from the member query and denied by direct read;
- unrestricted channel query denied;
- normal-member announcement write denied while staff announcement write allowed;
- GitHub self-enrollment allowed only while `settings/workspace.accessMode` is `"open"`, with request-mode, missing-workspace, cross-user, self-promotion, self-deactivation, settings-write, and non-GitHub attempts denied;
- private child messages/replies and a DM root/message/reply denied to a nonparticipant, including active `staff` and `admin` identities;
- non-null attachment-bearing channel-message create denied.

Expected `PERMISSION_DENIED` responses were observed for the negative cases. This verifies local Rules behavior only; it does not replace live two-account realtime, DM-isolation, final-PM, or load evidence.

## Security/configuration checks

- The checked-in runtime is the deployed public Firebase configuration with `demoMode: false`; the test suite uses isolated demo/production fixtures rather than editing that runtime file.
- No GitHub token, private key, OAuth secret, Firebase Admin key, or webhook secret pattern is permitted in public configuration.
- Firestore DM reads use explicit conversation participation; there is no staff/admin blanket read bypass.
- The active manifest deploys no Storage or Functions target and exposes no inbound webhook route.
- New attachment metadata is denied at the UI, adapter, and Firestore-rule layers.

## Live Firebase validation completed

- Firebase Hosting is live at `https://vera-ae3af.web.app`.
- Spark-only deployment was re-run successfully for Firestore rules, both required `channels` indexes, and Hosting on July 23, 2026.
- Both required `channels` indexes are enabled in Firestore Console: `type ASC, sort ASC` and `memberIds CONTAINS, sort ASC`.
- GitHub OAuth succeeds on that HTTPS domain.
- `settings/workspace` is set to `accessMode: "open"`, `cohortCapacity: 65`, and `workspaceName: "Hult Cohort"`.
- The signed-in GitHub account self-enrolled as an active `member` without an approval record; it was then designated `staff` in Firestore Console. The stale pending request was removed.
- Six shared public channels were created through the member UI. The channel named `announcements` now has `postingRoles: ["staff"]`; the other shared rooms remain member-postable.
- The signed-out production landing screen was rechecked after the Hosting release and loads at `https://vera-ae3af.web.app`.
- After refreshing the designated staff account on the deployed app, `#announcements` shows an enabled composer for that account. The Emulator supplies the paired normal-member denial.
- `config.js` now configures Forth for both the PM platform and board URL: `https://forth-bice.vercel.app/`; Hosting was redeployed after that change.
- All six existing shared-channel `pmUrl` values were updated from the stale Relay URL to the Forth board URL. On the deployed `#ship-room`, the linked board URL and Forth board card both resolve to Forth; the task-card composer accepted a Forth HTTPS link and was cleared without posting a test message.

## Checks still to run

- two-account realtime message, mention, thread, and DM-isolation testing;
- the 15-concurrent-participant burst test in `LOAD_TEST.md`.

Attachments and live inbound webhook delivery are **not unfinished Spark checks**. They are intentionally deferred to the future Blaze upgrade described in [DEPLOYMENT.md](DEPLOYMENT.md#future-blaze-upgrade--not-part-of-this-release). Use the Spark production checklist in `DEPLOYMENT.md` before filling unchecked items in `PR_BODY.md`.
