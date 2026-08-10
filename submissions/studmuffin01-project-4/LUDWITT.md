# Ludwitt wiring — your checklist

You do the registration in the browser (or local API sandbox). The app already knows how to verify tokens and send events.

## Live deployment (this submission)

| Item | Value |
|------|--------|
| Production site | https://prompt-like-a-pro-red.vercel.app |
| Launch URL | https://prompt-like-a-pro-red.vercel.app/launch |
| Integration checklist | https://prompt-like-a-pro-red.vercel.app/integration |
| Cohort PR | https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/274 |
| Vercel project | `prompt-like-a-pro` (team Rawle) — root `submissions/studmuffin01-project-4`, branch `participants/summer26/phase-2-learning-app/studmuffin01` |

Secrets stay in Vercel Environment Variables / local `.env.local` — never commit them.

## A. Register the app (you)

1. Open https://ludwitt.com/developers (or staff’s current developer portal), **or** use the local API package for sandbox practice (section E).
2. Create / register an app with roughly:
   - **Title:** Prompt Like a Pro: The SCORE Method for Copilot  
   - **Description:** ≥ 100 characters — professional prompting with SCORE for managers, analysts, lawyers, etc.  
   - **Topic:** Professional skills / Prompt engineering  
   - **Launch URL:** `http://localhost:3000/launch` for local tests → production: `https://prompt-like-a-pro-red.vercel.app/launch`  
   - **Repo URL:** https://github.com/Studmuffin01/hult-cohort-program (fork) or cohort PR head  
3. Save these three values somewhere private:
   - `app_id`
   - `api_key`
   - `jwt_secret`

Never commit them. Never paste `api_key` / `jwt_secret` into chat or the PR body (app id on the PR is OK).

## B. Put keys in the app (local)

```bat
cd submissions\studmuffin01-project-4
copy .env.example .env.local
```

Edit `.env.local` and fill:

```
LUDWITT_APP_ID=...
LUDWITT_API_KEY=...
LUDWITT_JWT_SECRET=...
LUDWITT_API_BASE_URL=https://api.ludwitt.hult/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOW_DEV_BYPASS=true
```

**Local sandbox note:** `execution/ludwitt-hult-api` authenticates events with the
**developer** key (`prod_key_demo`), not the `app_…` key returned at registration.
Keep `app_id` + `jwt_secret` from register; set `LUDWITT_API_KEY=prod_key_demo` and
`LUDWITT_API_BASE_URL=http://localhost:4000/v1`.

Restart `npm run dev` after any env change.

## C. Confirm wiring in the UI (local)

1. Open http://localhost:3000/integration  
2. All three secrets should show **OK**  
3. Start a session (bypass or real token)  
4. Click **Ping lesson_started**  
   - `mode=live` → API accepted the event  
   - `mode=dry-run` → keys still missing or wrong env file  

## D. Test real launch JWT (local)

With `LUDWITT_JWT_SECRET` set:

```bat
node scripts\mint-launch-token.mjs
```

Open the printed URL. You should land on Module 01 — **not** “Launch from Ludwitt/Hult”.

## E. Optional: local Ludwitt API sandbox

If the public API is down or you want a dry practice:

```bat
cd execution\ludwitt-hult-api
npm install
npm run dev
```

Point `LUDWITT_API_BASE_URL=http://localhost:4000/v1`, register via that API (`DEVELOPER.md`), put returned creds in `.env.local`.

Quick register from this package:

```bat
node scripts\register-ludwitt-app.mjs
```

## F. Production (Vercel) — current status

Deployed. Keep these Vercel env vars in sync (Production):

| Variable | Notes |
|----------|--------|
| `LUDWITT_APP_ID` | From registration |
| `LUDWITT_API_KEY` | Developer/events key for the **public** API host |
| `LUDWITT_JWT_SECRET` | From registration |
| `LUDWITT_API_BASE_URL` | Must be a **public** URL (not `http://localhost:4000/v1`) for events to count on Vercel |
| `NEXT_PUBLIC_APP_URL` | `https://prompt-like-a-pro-red.vercel.app` |
| `ALLOW_DEV_BYPASS` | `false` |

Then:

1. Update Ludwitt listing **launch_url** to `https://prompt-like-a-pro-red.vercel.app/launch` when on a production Ludwitt host  
2. Redeploy after any env change  
3. Launch from Ludwitt once and confirm production `/integration` session source is `ludwitt`  
4. Promote externally; paste a dated metrics snapshot on PR #274 toward ≥25 qualified users  

## Merge bar reminder

Sunday needs evidence of:

1. Registered app (app id + listing URL)  
2. Working `/launch?token=` (bad token → “Launch from Ludwitt/Hult”)  
3. Events firing (≥1 non-heartbeat per session)  

Pass gate (≥25 qualified external users) is verified from the platform metrics snapshot — PR may stay open while counts climb.
