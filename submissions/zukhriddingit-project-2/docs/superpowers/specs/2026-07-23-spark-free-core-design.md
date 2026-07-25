# Relay 65 Spark Free-Core Design

## Goal

Ship Relay 65 on Firebase's no-cost Spark plan with GitHub authentication, Firestore-backed realtime communication, private-channel authorization, and Firebase Hosting. The release must not initialize, deploy, or route requests to Cloud Storage or Cloud Functions.

## Release boundary

Included in the Spark release:

- Firebase Authentication with the GitHub provider;
- Cloud Firestore for members, public and private channels, direct messages, threads, reactions, notifications, and PM task cards/deep links;
- Firebase Hosting for the static web application;
- the existing Firestore rules, ordered channel indexes, two rule-compatible channel listeners, and Firestore Emulator authorization smoke test.

Deferred until a deliberate Blaze upgrade:

- authenticated file upload/download through Cloud Storage;
- the signed PM and GitHub webhook bridge through Cloud Functions;
- Hosting routes at `/api/pm-webhook` and `/api/github-webhook`.

The `functions/` directory and `storage.rules` remain as deferred upgrade source. They are not part of the Spark deployment manifest and must not be described as active capabilities.

## Configuration contract

Both `config.js` and `config.example.js` declare:

```js
attachmentsEnabled: false
```

The runtime validator requires this explicit `false` value for the Spark release. It continues to require the six public Firebase web configuration identifiers in production mode, including `storageBucket`; that identifier is part of normal Firebase Web config but does not initialize or deploy Storage.

`maxUploadBytes` is removed because uploads are unavailable. GitHub OAuth client secrets, webhook secrets, service-account credentials, private keys, and personal access tokens remain prohibited from public configuration.

## User experience

The composer retains a visible paperclip so the capability boundary is discoverable. It is visually disabled, exposes `aria-disabled="true"`, and remains keyboard-reachable. Activating it displays this non-error explanation:

> Attachments are unavailable in the free Firebase release.

No file picker is present, no file data is read in the browser, and no adapter upload method is invoked by normal UI flows. PM task attachment remains available because it is a client-only deep-link card, not a file upload.

Existing local demo fixtures with a safe direct asset URL may still render as historical/example content. Existing Firebase attachment records with a `storagePath` render as unavailable; the Spark app must not call Cloud Storage to resolve them.

## Adapter and rule behavior

`FirebaseAdapter` no longer dynamically imports `firebase-storage.js`, calls `getStorage`, uploads blobs, or resolves Cloud Storage paths. `DemoAdapter` and `FirebaseAdapter` retain matching `uploadFile()` guard methods that reject with the same clear unavailable message, protecting the adapter boundary from accidental future UI calls without contacting Storage.

New Firestore messages and replies cannot introduce attachment content:

- creates accept no attachment field or an explicit `null` attachment only;
- ordinary message edits cannot alter `attachment`;
- existing attachment metadata may be preserved on unrelated edits but cannot be created or changed.

This rule-level guard keeps direct Firestore clients from bypassing the disabled UI. Private-channel and DM authorization is otherwise unchanged.

## Deployment configuration

`firebase.json` contains:

- Hosting headers and only the SPA catch-all rewrite to `/index.html`;
- Firestore rules and index configuration.

It contains no Cloud Functions rewrite, no `/api/*-webhook` path, no top-level `functions` source, and no top-level `storage` rules target. Its Content Security Policy contains no `firebasestorage.googleapis.com` origin.

The only first-release deployment command is:

```bash
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

The operator configures a Firebase Web app, Firestore in Production mode, Firebase Authentication with GitHub, and Firebase Hosting. They do not provision Storage, install Function dependencies, configure Function secrets, or upgrade billing for this release. They deploy before the first GitHub sign-in, then use the exposed UID to bootstrap the first administrator and `settings/workspace` document.

## Documentation and QA

All user-facing documentation describes Spark core accurately. It removes active claims for Storage, file uploads, Function secrets, inbound webhooks, Blaze billing, and combined Functions/Hosting deployment. It preserves PM board links and task cards, and adds a distinct future-Blaze-upgrade section for the deferred capabilities.

The root suite gains regression coverage for the Spark manifest, disabled attachment affordance, absence of Storage SDK use, adapter guard behavior, and the attachment rule restriction. Existing Firestore channel listener and Emulator checks remain required. The Emulator smoke suite additionally proves that a direct attachment-bearing write is denied if the test harness can exercise that path without broadening its existing security cases.

## Acceptance criteria

1. The public UI cannot open a file picker or upload a file, and presents the Spark-release explanation from the paperclip control.
2. Neither adapter performs local-file encoding or Firebase Storage access; an unexpected adapter upload call rejects safely.
3. Direct Firestore clients cannot create or mutate an attachment in a message or reply.
4. `firebase.json` cannot deploy Functions or Storage and has no webhook rewrites or Storage CSP origins.
5. `npm test` validates the Spark release rather than paid-feature configuration.
6. The Firestore Emulator still passes public/listed-private/unlisted-private/unrestricted-channel authorization checks.
7. Documentation gives the exact no-billing deploy command and preserves deployment-before-admin-bootstrap order.

## Non-goals

- Migrating Relay to Supabase or another backend;
- adding a third-party free file-storage provider;
- removing existing historical/demo attachment rendering;
- changing channel, DM, membership, OAuth, or PM deep-link behavior;
- deploying to the Firebase project before the operator has supplied its public Web configuration and completed GitHub OAuth setup.
