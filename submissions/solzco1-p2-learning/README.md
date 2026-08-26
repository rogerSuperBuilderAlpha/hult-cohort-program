# DealForge — Enterprise Sales Learning App

**DealForge** teaches B2B / enterprise sales: discovery, CFO-ready business cases, and multi-stakeholder negotiation. Built for Hult Phase 2 Project 1 (P2-L1).

## Stack

- Next.js 14 App Router, TypeScript, Tailwind
- Ludwitt Learning Engineers OAuth 2.0 + PKCE ([ludwitt.com/developers](https://ludwitt.com/developers))
- Optional Hult events API + JWT launch fallback per [integration spec](../../curriculum/phase-2/project-1-learning-app/integration-spec.md)

## Fresh clone

```bash
npm install
cp .env.example .env.local
# Fill Ludwitt credentials (see below)
npm run dev
```

Open http://localhost:3000

## Ludwitt app registration (required before OAuth works)

Connecting GitHub at ludwitt.com/developers **does not** register your app. You still need to create one:

1. Sign in at [ludwitt.com/developers](https://ludwitt.com/developers) (GitHub is fine for identity).
2. Open **Create app** (Learning Engineers portal — BYOB tier: OAuth identity + your backend).
3. Set **redirect URIs**:
   - `http://localhost:3000/api/auth/ludwitt/callback` (local)
   - `https://dealforge-learn.vercel.app/api/auth/ludwitt/callback` (production)
4. Scopes: `profile` plus `data:read` / `data:write` if using hosted-data for events.
5. Copy **Client ID** (`le_…`) and **Client secret** (shown once) into `.env.local`.
6. If the portal also issues Hult platform keys, copy `app_id`, `api_key`, and `jwt_secret` for events + `/launch?token=` flow.

## Environment

See `.env.example`. Never commit `.env.local`.

## Validation

```bash
npm test
npm run build
```

## Integration evidence (for your PR)

Graders need proof that Ludwitt integration works. Document all three in the PR body:

### 1. Ludwitt / Hult app ID

Paste your registered client or app ID, e.g. `le_abc123…` (OAuth) and/or Hult `app_id` if separate.

### 2. Production listing URL

After Vercel deploy: `https://dealforge-learn.vercel.app` (or your assigned subdomain).

### 3. Integration evidence

Show **both**:

**A. Sign-in / launch**

- Click **Sign in with Ludwitt** on production → complete OAuth → land on `/learn` signed in.
- Screenshot or note: user email visible, protected routes redirect when logged out.

**B. Events firing**

- Open a lesson → `lesson_started` posts to Ludwitt (Hult API or hosted-data).
- Mark complete → `lesson_completed`; submit quiz → `quiz_submitted`.
- Evidence: Ludwitt developer dashboard / hosted-data viewer **or** Vercel function logs showing `[dealforge:event]` in dev fallback.

Minimum pass: ≥ 1 non-heartbeat event per session ([spec](../../curriculum/phase-2/project-1-learning-app/integration-spec.md)).

## Deploy (Vercel)

Root directory: `submissions/solzco1-p2-learning`

Set env vars in Vercel project settings (same account as Pulse). Redeploy after adding Ludwitt credentials.

```bash
npx vercel deploy --prod
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + Ludwitt sign-in |
| `/learn` | Curriculum (auth required) |
| `/learn/[id]` | Lesson + events |
| `/quiz` | Capstone quiz |
| `/launch?token=` | JWT launch fallback |
| `/api/auth/ludwitt/login` | OAuth PKCE start |
| `/api/auth/ludwitt/callback` | OAuth callback |
| `/api/events` | POST learning events |
