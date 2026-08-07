# Agent guide

## Product intent

Preserve Relay 65’s core idea: durable async communication with realtime delivery. Do not turn the product into an undifferentiated Discord clone. Signal types, threads, PM deep links, private DMs, and an obvious reviewer path are first-class behavior.

## Code map

- `index.html` — static application shell; keep landmarks and labels accessible.
- `styles.css` — visual system and responsive behavior; avoid framework dependencies.
- `src/app.js` — UI state/rendering and event delegation.
- `src/adapters/demo.js` — local persistent implementation of the adapter contract.
- `src/adapters/firebase.js` — production implementation; authorization still belongs in rules.
- `src/data.js` — review/demo fixtures only.
- `firestore.rules` — active Spark security boundary; test every change with adversarial users.
- `storage.rules` — deferred future Blaze-upgrade source; it is not deployed by the Spark manifest.
- `functions/index.js` — deferred signed external-event bridge; it is not deployed and has no Hosting rewrite in the Spark release.

## Change rules

1. Any new production feature must work through the adapter abstraction or explicitly document why it cannot.
2. Keep demo and Firebase behavior semantically aligned.
3. Do not add a staff/admin bypass to DM reads.
4. Do not commit credentials or replace placeholders with invented URLs.
5. Sanitize or escape all user-controlled rendering.
6. Bound reads and webhook input. Spark uploads are unavailable: preserve the explicit attachment guard rather than adding a Storage path.
7. Keep `npm test` dependency-free at the root.
8. Update `README.md`, `ARCHITECTURE.md`, and the PR test plan when behavior changes.

## Validation

```bash
npm test
python3 -m http.server 4173
```

Open `http://localhost:4173/?demo=1` and check desktop plus 390 × 844. Before production release, run the two-user privacy/realtime smoke checks in `DEPLOYMENT.md`.

## Active release profile

Relay 65 currently deploys Firebase Authentication, Firestore, and Hosting on the no-billing Spark plan:

```bash
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

Do not add a Cloud Storage target, Cloud Functions target, or webhook rewrite to the active manifest. Attachments and inbound webhooks are deferred until an explicit future Blaze upgrade restores and verifies those capabilities together.
