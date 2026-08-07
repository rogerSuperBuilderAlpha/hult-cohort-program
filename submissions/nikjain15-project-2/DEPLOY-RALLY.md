# Deploying Rally to production (its own Vercel + Firebase)

Rally deploys to its **own** target — never Pulse's `pm-nikjain15`. Two services: **Firebase**
(auth + data) and **Vercel** (hosting). Steps marked 👤 need your accounts; the rest I can run.

## 1. 👤 Firebase project (auth + database)
1. https://console.firebase.google.com → **Add project** → name it `rally-nikjain15` (or similar).
2. **Build → Firestore Database → Create database** (production mode, any region).
3. **Build → Authentication → Get started → Sign-in method → GitHub → Enable.**
   - It asks for a **GitHub OAuth Client ID + Secret**. Create one at
     https://github.com/settings/developers → **New OAuth App**:
     - Homepage URL: `https://rally-nikjain15.vercel.app` (your Vercel URL, set after step 3)
     - Authorization callback URL: the one Firebase shows on the GitHub provider screen
       (`https://rally-nikjain15.firebaseapp.com/__/auth/handler`)
   - Paste the Client ID + Secret back into Firebase, Save.
4. **Project settings → General → Your apps → Web app** → register → copy the `firebaseConfig`
   values (apiKey, authDomain, projectId, …) — these fill the `NEXT_PUBLIC_FIREBASE_*` vars.
5. **Project settings → Service accounts → Generate new private key** → download the JSON —
   this is `FIREBASE_SERVICE_ACCOUNT` (paste the whole JSON as one env value).
6. Push the security rules to the project:
   `./node_modules/.bin/firebase deploy --only firestore:rules --project rally-nikjain15`

## 2. 👤 Vercel login
`vercel login`  (I'll drive `vercel` after this.)

## 3. Deploy (I run these)
From `submissions/nikjain15-project-2`:
```
vercel link            # create a NEW Rally project (do NOT reuse Pulse's)
# set env for Production (from your Firebase config + keys):
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# …repeat for each NEXT_PUBLIC_FIREBASE_*, FIREBASE_SERVICE_ACCOUNT, ANTHROPIC_API_KEY
vercel --prod          # build + deploy → prints the production URL
```

## 4. Verify (I run this)
```
curl -s https://<your-rally-url>/api/health
# expect: {"app":"rally","ok":true,"enrolled":65,"build":"<sha>"}   (NOT 404)
```
Then open the URL, sign in with GitHub, and it's live for the cohort.

---
Give me the Firebase config values (step 1.4/1.5) once you have them, confirm `vercel login`,
and I'll do steps 3–4.
