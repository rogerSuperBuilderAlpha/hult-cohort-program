# Project 2 Submission — @mitchelldante99-create

Summer Pilot 2026, Project 2 — "Ascended Learning," a study/revision-tips app integrated with the Ludwitt platform (OAuth/PKCE sign-in, hosted-storage event tracking).

## Ludwitt/Hult app ID
`le_5acc3108870546e2f1e02d`

## Production URL
https://ascended-learning.vercel.app/

## Build repo
Source lives in this monorepo at [`submissions/mitchelldante99-create-project-2/`](./mitchelldante99-create-project-2/).

## Setup steps verified on fresh clone
1. `npm install`
2. `cp .env.local.example .env.local` and fill in `LUDWITT_CLIENT_SECRET` (from the Ludwitt app settings page) and a random `SESSION_SECRET`
3. `npm run dev`
4. Visit `http://localhost:3000`, click "Sign in with Ludwitt"

`npm run build` and typecheck pass cleanly.

## Integration evidence (launch flow + events firing)
The app is registered on Ludwitt (`le_5acc3108870546e2f1e02d`) and currently **"In review"**. Ludwitt's review page states live OAuth sign-in is gated until app approval, and provides Test Mode specifically to verify integration before then. Verified via Test Mode sandbox token:

**Launch / auth flow:**
```
GET /api/oauth/userinfo → { sub, email, name, picture } returned successfully
```

**Event firing (write to declared `progress` collection):**
```
PUT /api/v1/data/progress/:docId → { etag, sizeBytes, quota } returned successfully
```

The production deploy correctly constructs the OAuth authorize URL with the right `client_id` and `redirect_uri` (both `localhost` and the production callback are registered). It currently returns `invalid_client` on the live authorize flow only, which is expected while in review — this resolves automatically on approval with no code changes required.

## Architecture summary
Next.js 16 (App Router) + TypeScript + Tailwind. PKCE-based OAuth against Ludwitt (`lib/pkce.ts`, `lib/session.ts`, `app/api/auth/login`, `app/auth/callback`), signed httpOnly session cookies, a static tips list served client-side, and a `progress` collection (Ludwitt hosted-storage) tracking which tips a signed-in user has viewed.

## Known limitations
- Live browser OAuth click-through pending Ludwitt app approval (Test Mode used as interim verification, per Ludwitt's own guidance)
- Hosted-storage tier (no self-hosted backend/database beyond what Ludwitt provides)
- Tips content is static; no admin UI to add/edit tips

## Agent usage summary
Built with Claude — scaffolded the Next.js app, implemented PKCE OAuth flow and session handling, built the tips UI and `progress`-collection read/write, deployed to Vercel, debugged production env var propagation, and verified the integration end-to-end via Ludwitt's Test Mode sandbox.
