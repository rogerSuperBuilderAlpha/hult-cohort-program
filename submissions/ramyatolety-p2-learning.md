# Phase 2 Learning App Submission — @ramyatolety

**Ramya Tolety** · Hult Cohort Developer Program · Summer 2026 · Week 4 (`phase-2-learning-app`)

**Production listing URL:** https://atelier-ramyatolety.vercel.app
**Repo:** https://github.com/RamyaTolety/atelier-ramyatolety

## Summary

Atelier is a public learning app: 13 tracks and 39 lessons covering design tools (Figma,
Canva), video and content craft (video editing, YouTube, short-form video), traditional art
media (paper art, watercolor, painting), world art traditions (Sumi-e, Madhubani, Papel
Picado), and writing craft (newsletter and novel writing). Each lesson has a practice exercise,
an apply-it challenge, and a quiz, plus sourced free and paid resources and getting-started
tips per track. No account is required to browse or take quizzes; signing in with Ludwitt
saves progress between visits.

## Ludwitt app ID

Registered on the Ludwitt Creator dashboard (`ludwitt.com/developers`, Creator tab),
Bring-your-own-backend tier:

`le_1f3acb84520aac8b6fe22c`

## Production listing URL

https://atelier-ramyatolety.vercel.app

## Integration evidence (sign-in flow + identity)

Ludwitt's real Creator platform integration is OAuth-based, confirmed directly from the
authenticated Creator dashboard's own generated integration prompt, not the JWT-launch model
described in early cohort emails. Atelier implements:

- `GET /auth/login`: redirects to Ludwitt's OAuth authorize endpoint
  (`https://pitchrise.ludwitt.com/oauth/authorize`) with `client_id`, the production
  `redirect_uri`, `response_type=code`, `scope=profile`, and a CSRF `state` stored in a signed
  httpOnly cookie.
- `GET /auth/callback`: verifies `state`, exchanges the authorization code for a token
  server-to-server (`POST /api/oauth/token`), reads identity from `GET /api/oauth/userinfo`,
  then discards the Ludwitt access token and issues Atelier's own short-lived session cookie.
- Verified server-side (`curl -I https://atelier-ramyatolety.vercel.app/auth/login`) that the
  redirect target contains the correct `client_id`, production `redirect_uri`, and `scope`.
- Verified the identity-fetch code directly against Ludwitt's real API using a Ludwitt-issued
  test access token (from the Creator dashboard's "Test mode" flow): `GET
  https://pitchrise.ludwitt.com/api/oauth/userinfo` returned `HTTP 200` with `{ sub, email,
  name, picture }` in exactly the shape `fetchUserinfo()` expects, and the correct account data.
- The live browser consent screen (`/oauth/authorize`) currently returns `invalid_client`
  because the app is still at Ludwitt's "Get ready" stage and hasn't cleared their own app
  review queue (submitted for review; their dashboard states a 1 to 2 business day turnaround).
  This is a platform-side gate, not an integration bug, the same category of issue as the ALC
  portal lock other cohort members hit and documented rather than worked around.

This app requests only the `profile` scope. It does not request `credits:read` or
`credits:spend`, and never calls the AI-proxy or credit-balance endpoints, since it has no AI
feature that would spend a student's Ludwitt credits.

## Promotion channels used

None yet at time of submission. Per the cohort's correction email, external adoption is
measured later in the program and is not a condition of merging this PR.

## Agent usage

- **Research:** read the cohort's own GitHub repo and its in-progress `ludwitt-hult-api` spec,
  fetched and cross-checked the real `ludwitt.com/developers` portal and the
  `pitchrise.ludwitt.com` Creator platform, verified the sender domain on four cohort emails,
  and held off acting on an unverified OAuth/credentials prompt until it was independently
  confirmed via the user's own authenticated Creator dashboard screenshot.
- **Dev:** scaffolded the Next.js 16 + TypeScript + Tailwind + Firebase app; wrote all 39
  lessons across 13 tracks with sourced free/paid resource links and getting-started tips;
  implemented Ludwitt OAuth sign-in end to end; Firestore-backed lesson progress tracking that
  fails soft when unconfigured; kept the whole site browsable with no account required.
- **QA:** verified a clean production build with no console errors, walked every page type
  (home, track, lesson, quiz interaction) in a live browser preview, confirmed the OAuth
  redirect target server-side, and had the human verify the live sign-in click-through since
  that step requires a real Ludwitt account.

## Test plan

- [x] Production build succeeds with no errors
- [x] Home, track, and lesson pages render correctly in a live browser preview
- [x] Quiz interaction works and gracefully degrades with no session (no login required to browse)
- [x] `/auth/login` redirects to the correct Ludwitt authorize URL (verified via `curl -I`)
- [x] Identity-fetch code verified against the real Ludwitt API via a test access token (HTTP 200, correct shape and data)
- [ ] Full browser consent click-through, blocked on Ludwitt's app review queue (submitted, 1-2 business day turnaround per their dashboard)
- [x] App registered on Ludwitt Creator dashboard, Bring-your-own-backend tier
