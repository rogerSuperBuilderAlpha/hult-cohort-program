# Week 4 Learning App — Portable Build Context

## Mission and acceptance gate

Act as a learning engineer: ship a production learning application registered on the Ludwitt/Hult platform, with operational OAuth 2.0 authentication and AI tutor integration. The Week 4 bar is the integration itself:

1. The app is registered in the Ludwitt/Hult developer portal.
2. Ludwitt OAuth 2.0 sign-in flow validates and creates a secure server-side session.
3. AI tutor requests successfully proxy through Ludwitt with credit tracking.
4. A proof-of-work pull request is merged on the target branch.

There is **no user-count condition** for Week 4. External adoption is measured later from the platform snapshot and is not a merge requirement.

Build: **PyByte: Learn Python in 5 Minutes a Day**. Keep the Ludwitt registration topic, app content, and promotion message aligned.

Source of truth: verify the current request/response fields, authentication header, and API schema in the Ludwitt Developer Portal before implementation. This file records the cohort brief; it must not override the portal API reference.

## Ludwitt OAuth 2.0 Integration

The registered PyByte app uses the Ludwitt BYOB OAuth integration. The portal-issued client ID is `le_aa66000f7ab45563e7b4dd`; its client secret is server-only and must never be committed or exposed to the browser.

- Browser sign-in: `GET /api/auth/signin` creates a CSRF state value and PKCE S256 challenge, then redirects to `https://pitchrise.ludwitt.com/oauth/authorize` with scopes `profile credits:read credits:spend`.
- Callback: `GET /api/auth/callback` verifies state, exchanges the OAuth code server-to-server at `https://pitchrise.ludwitt.com/api/oauth/token`, obtains identity from `/api/oauth/userinfo`, and stores encrypted access/refresh tokens in an HTTP-only session cookie.
- API use: `/api/credits` reads `spendableCents`; `/api/tutor` sends an AI request through `https://pitchrise.ludwitt.com/api/v1/ai/messages`. A 402 response is shown as a paid-credit top-up message without retrying.
- Local redirect URI: `http://localhost:3000/api/auth/callback`. Add the matching HTTPS Vercel callback URI in the portal before production testing.
- Required server environment variables: `LUDWITT_CLIENT_ID`, `LUDWITT_CLIENT_SECRET`, `SESSION_SECRET`, and `LUDWITT_REDIRECT_URI`.

## Non-negotiable platform requirements

- Register the app through the Ludwitt/Hult developer portal and retain its client ID, listing URL, and portal-issued credentials.
- Keep the returned `LUDWITT_CLIENT_SECRET` and `SESSION_SECRET` out of git and browser-delivered environment variables.
- Users enter only through OAuth sign-in flow (`/api/auth/signin`). Use PKCE S256 for secure code exchange.
- Invalid, expired, or failed OAuth callbacks must return an error message and not create a session.
- AI tutor requests proxy through Ludwitt API with proper credit tracking via `spendableCents`.
- Do not treat metrics or any user-count threshold as a Week 4 acceptance requirement.
- Never fabricate identities, sessions, or API requests.
- Open the PR from `participants/summer26/phase-2-learning-app/{handle}` into `projects/summer26/phase-2-learning-app`, titled `[P2-L1] Submission — {handle}`.

## Architecture decisions

Use Next.js App Router, JavaScript, server route handlers, and the `jose` package for session encryption. Use Vercel for deployment. No database is required for the one-hour MVP.

```
Ludwitt OAuth sign-in
  -> GET /api/auth/signin
  -> server creates PKCE challenge + OAuth state
  -> redirect to Ludwitt OAuth authorize
  -> user authorizes
  -> GET /api/auth/callback?code=...
  -> server exchanges code for tokens
  -> server fetches user profile
  -> encrypted HTTP-only session cookie
  -> redirect to /learn
  -> /api/credits reads spendableCents
  -> /api/tutor proxies AI requests with credit tracking
```

### Critical security and counting decisions

1. **Never accept `userId` from the browser.** The server derives the Ludwitt `sub` from the verified server-side session. Otherwise anyone can impersonate a user.
2. **Keep the session HTTP-only.** Client JavaScript cannot and must not read it. The `/learn` server page receives the authenticated profile from a server helper; client components call `/api/me` for minimal safe display data when needed.
3. **Use an encrypted session cookie.** Use encrypted JWT/JWE containing `sub`, `email`, `name`, `picture`, access/refresh tokens; use `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`, `Max-Age=30d`.
4. **Fail closed.** No session, invalid OAuth state, missing configuration, or failed Ludwitt API responses must return an error and be logged server-side without secrets.
5. **Implement token refresh.** Automatically refresh access tokens when they expire to maintain seamless user experience.

## Proposed project layout

```
src/
  app/
    api/
      auth/
        signin/route.js          # initiates OAuth flow with PKCE
        callback/route.js        # OAuth callback; exchanges code; creates session
      credits/route.js           # reads Ludwitt credit balance
      me/route.js                # returns minimal safe authenticated profile
      tutor/route.js             # proxies AI tutor requests to Ludwitt
    learn/
      page.js                    # server auth gate; renders learning experience
      LearningClient.js          # client UI/state; never knows user ID or platform keys
    layout.js
    page.js                      # public landing + sign-in CTA
    globals.css
  lib/
    auth.js                      # OAuth state, PKCE, session encryption/decryption
    ludwitt.js                   # Ludwitt OAuth token exchange, userinfo, credits, AI
    course.js                    # lessons, quiz questions, accepted answers
    session.js                   # active session with automatic token refresh
    env.js                       # validates required server env at startup/use
```

Keep the session HTTP-only. `/api/me` may return only the minimal safe profile needed by the UI; never expose the cookie, secrets, or a client-controlled identity.

## Environment variables and secret handling

Create `.env.local` locally and add the same server variables in Vercel. Commit only `.env.example` with blank values.

```dotenv
LUDWITT_CLIENT_ID=le_aa66000f7ab45563e7b4dd
LUDWITT_CLIENT_SECRET=
SESSION_SECRET=
LUDWITT_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

`NEXT_PUBLIC_APP_URL` is the only browser-visible value above. Never prefix client secrets or session secrets with `NEXT_PUBLIC_`. Update `LUDWITT_REDIRECT_URI` for production (e.g., `https://your-app.vercel.app/api/auth/callback`).

## Endpoint contracts to implement

### `GET /api/auth/signin`

1. Validate configuration.
2. Generate PKCE verifier and code challenge (S256).
3. Generate OAuth state and store encrypted state + verifier in HTTP-only cookie.
4. Redirect to Ludwitt OAuth authorize endpoint with proper parameters.
5. On failure, return error status 500.

### `GET /api/auth/callback?code=<code>&state=<state>`

1. Read and verify OAuth state from cookie; match against callback state parameter.
2. Exchange authorization code for access/refresh tokens server-to-server.
3. Fetch user profile from Ludwitt userinfo endpoint.
4. Create encrypted HTTP-only session with profile and tokens.
5. Redirect to `/learn`. On any failure, return error and clear state cookie.

### `GET /api/me`

1. Read and verify HTTP-only session.
2. Return minimal safe profile (sub, email, name, picture).
3. Automatically refresh access token if expired.
4. Return 401 if no valid session.

### `GET /api/credits`

1. Read and verify HTTP-only session.
2. Call Ludwitt credits balance endpoint with access token.
3. Return spendableCents and formatted balance.
4. Return 401 if no valid session; return 502 on Ludwitt API failure.

### `POST /api/tutor`

1. Read and verify HTTP-only session.
2. Validate prompt (max 1200 characters).
3. Proxy request to Ludwitt AI messages endpoint with access token.
4. Return AI response text and updated credit balance.
5. Return 402 if out of credits with top-up URL.
6. Return 401 if no valid session; return 502 on Ludwitt API failure.

## Learning-product scope

Single goal: help a learner build a daily Python habit through six focused five-minute lessons and their associated quizzes.

- Provide the six Python lessons and six quizzes from the approved content bank.
- Users can ask the AI tutor for help with Python concepts using their Ludwitt credits.

Keep every CTA explicit and fast. The design should be clean and mobile-first, but content completion and AI tutor functionality take priority over animation, accounts, leaderboards, or a custom backend.

## One-hour execution plan

| Time | Outcome |
| --- | --- |
| 0–10 min | Register app, create Vercel project, set all secrets, record client ID locally; confirm the live portal schema. |
| 10–25 min | Scaffold Next.js, content, `/api/auth/signin`, `/api/auth/callback`, and session helpers. |
| 25–40 min | Build `/learn`, `/api/credits`, and `/api/tutor`; wire OAuth flow and AI tutor integration. |
| 40–50 min | Deploy, configure production variables, test OAuth flow end-to-end, verify AI tutor with credit tracking. |
| 50–60 min | Add remaining content, open the PR, and prepare it for merge. |

Do not spend the hour on a dashboard, custom authentication, database, or decorative effects. A verified end-to-end OAuth flow with AI tutor functionality is the milestone before polish.

## Verification checklist

- [ ] App registration response stored only in password manager/local secret store; no secrets tracked by Git.
- [ ] Invalid, expired, or failed OAuth callbacks return an error message and set no session.
- [ ] Valid OAuth flow redirects to `/learn` and creates a secure HTTP-only session.
- [ ] A direct `/learn` visit without a session is denied or redirected to the sign-in page.
- [ ] AI tutor requests successfully proxy through Ludwitt with proper credit tracking.
- [ ] Browser requests contain no client secret, session secret, or asserted user ID.
- [ ] API failures are visible in deployment logs and in the UI as a retryable message.
- [ ] The PR body includes the Ludwitt/Hult client ID, production listing URL, and integration evidence for the OAuth flow and AI tutor.
- [ ] PR is opened from the specified participant branch and merged into the target branch.

## Pull request proof of work

Use the required PR title: `[P2-L1] Submission — {handle}`.

The PR body must include:

- Ludwitt/Hult client ID
- Production listing URL
- Integration evidence: validated OAuth sign-in flow and AI tutor functionality

## Promotion plan

Promotion is optional for the Week 4 merge bar. If inviting a real external tester, use the Ludwitt listing/approved launch path rather than a direct anonymous dashboard URL.

## Instructions for any future LLM or IDE

- Inspect this file and the current Ludwitt Developer Portal documentation before changing integration code.
- Preserve security boundaries: OAuth verification and API requests are server-only; client components do not handle IDs or secrets.
- Prefer small, deployable changes. Do not add a database, auth provider, UI kit, analytics provider, or new route unless it directly improves the acceptance gate.
- When changing OAuth or AI code, test the complete chain: sign-in -> session -> AI tutor request -> Ludwitt accepted response.
- Never invent API fields. Mark portal-dependent values with a TODO and request/verify the current documentation.
- Update this document when infrastructure, endpoint contracts, course scope, deployment URL, or promotion strategy changes.
