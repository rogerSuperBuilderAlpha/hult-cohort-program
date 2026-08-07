# Start here

The app is complete and the ZIP is safe to explore immediately. Production credentials are intentionally blank.

## See the app in 30 seconds

```bash
cd relay65
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?demo=1
```

The demo is fully interactive and persists in your browser.

## Put it online

Relay 65's current online release uses Firebase **Spark core**: Authentication, Firestore, and Hosting without billing. Attachments and incoming PM/GitHub webhooks are intentionally deferred; the visible paperclip explains that limit without opening a file picker.

1. Follow [DEPLOYMENT.md](DEPLOYMENT.md) to create a Firebase Web app, enable Firebase Auth with GitHub, Firestore in Production mode, and Hosting. Do not provision Storage or Functions.
2. Copy your Firebase web values and final PM platform URLs into `config.js`, set `demoMode` to `false`, keep `attachmentsEnabled` as `false`, then enable GitHub sign-in with Firebase's `/__/auth/handler` callback.
3. Run `npm test` and the Firestore Emulator smoke test in `emulator/`.
4. Deploy with:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,hosting
   ```

5. In Firestore Console, create `settings/workspace` with `accessMode: "open"`, `cohortCapacity: 65`, and `workspaceName: "Hult Cohort"`. Every GitHub-authenticated visitor then self-enrols as an active `member`; create the shared public channels through the member UI.
6. Complete Spark-core production QA, then paste the final HTTPS URL, PM-platform details, and QA evidence into [PR_BODY.md](PR_BODY.md).

## Do not add these to Git

- GitHub OAuth client secret
- Firebase Admin service-account JSON
- Any private key or personal access token

Webhook secrets are not needed for the Spark release. They remain a future Blaze-upgrade-only concern and must never enter Git then either.

## Run the checks

```bash
npm test
```

Rerun the dependency-free root suite after configuring production and complete the package-local Firestore Emulator smoke test before deployment. Fresh Chromium checks were recorded at 1440 × 960 and 390 × 844; details and remaining production-only gaps are in [QA_REPORT.md](QA_REPORT.md).

## Future Blaze upgrade

`storage.rules` and `functions/` are retained only as deferred upgrade source. A later billing-backed upgrade must restore the manifest targets and webhook rewrites, install Function dependencies, set secrets, and test uploads/webhooks before using a combined deployment. Those steps are not part of the command above.

## Submit

Use the exact branch, base, PR title, body, and merge checklist in [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md).
