# Deploy participant platform (Vercel + Firebase)

## Vercel

1. Import project from GitHub
2. Root directory: `execution/marketing/site`
3. Framework preset: Next.js

## Environment variables

Set in Vercel → Settings → Environment Variables. Full list in [FIREBASE.md](FIREBASE.md).

**Client (public):**

- `NEXT_PUBLIC_FIREBASE_*` — six vars from Firebase console → Project settings → Your apps
- `NEXT_PUBLIC_APPLY_URL` — `/apply` (default; on-site form)
- `NEXT_PUBLIC_OVERVIEW_URL` — `/overview`
- `NEXT_PUBLIC_TAKE_HOME_REPO_URL` — admissions GitHub repo

**Server only:**

- `FIREBASE_SERVICE_ACCOUNT_JSON` — service account key JSON (single line)
- `GITHUB_WEBHOOK_SECRET` — for org webhook (when ballot automation live)

```bash
cd execution/marketing/site
npm install
npx vercel
```

## Firebase

1. Create project — see [FIREBASE.md](FIREBASE.md) setup checklist
2. Enable Firestore + GitHub Auth
3. Deploy rules: `firebase deploy --only firestore:rules` from `execution/marketing/`
4. Paste credentials into Vercel env

## Preview locally

```bash
cp .env.example .env.local   # fill Firebase values
npm install && npm run dev
```

## Pre-launch checklist

- [ ] Firebase credentials in Vercel (prod + preview)
- [ ] Test apply → document in Firestore Console
- [ ] General Counsel cleared guarantee / job offer copy
- [ ] Take-home repo published; `NEXT_PUBLIC_TAKE_HOME_REPO_URL` set
- [ ] OG image optional
- [ ] Analytics optional (Plausible)

## Custom domain

`cohort.hult.edu` → CNAME to Vercel per Hult IT.

## Supersedes

Typeform / external form links — apply is on-site at `/apply`, stored in Firebase.
