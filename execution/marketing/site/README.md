# Hult Cohort participant platform (Next.js + Firebase)

Landing, apply flow, and program journey. Backend: **Firebase** (Firestore + Auth). Deploy: **Vercel**.

## Develop

```bash
npm install
cp .env.example .env.local   # add Firebase credentials when provided
npm run dev
```

Open http://localhost:3000

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/overview` | Stakeholder summary |
| `/apply` | Application form → Firestore via API |
| `/program` | All phases and projects |
| `/program/[slug]` | Participant expectations per project |
| `/vote/[project]` | *(planned)* Ranked-choice ballot |

## Environment

See [.env.example](.env.example) and [FIREBASE.md](../FIREBASE.md).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Client Firebase config |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server Admin SDK (applications write) |
| `NEXT_PUBLIC_TAKE_HOME_REPO_URL` | Link in auto-reply after apply |

## Deploy (Vercel)

```bash
npx vercel
```

Root directory in monorepo: `execution/marketing/site`.

⚠️ Do not deploy public marketing until General Counsel clears guarantee language.

## Build

```bash
npm run build
npm start
```

## Implementation note

`POST /api/applications` currently writes to `data/applications/` locally. Replace with Firebase Admin SDK once credentials are configured — see [FIREBASE.md](../FIREBASE.md).
