# Firebase project config (link after credentials provided)

Run from `execution/marketing/`:

```bash
firebase login
firebase use --add   # select hult-cohort-fall26 (or your project id)
firebase deploy --only firestore:rules
```

Place `firebase.json` here when initializing:

```json
{
  "firestore": {
    "rules": "firebase/firestore.rules"
  }
}
```

Do not commit service account keys. Local path:

```
execution/marketing/site/secrets/firebase-service-account.json   # gitignored
```

Copy from Firebase Console → Project settings → Service accounts → Generate new private key.

Set in `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_PATH=secrets/firebase-service-account.json
```

On Vercel, use `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON as one line) instead — files are not deployed.
