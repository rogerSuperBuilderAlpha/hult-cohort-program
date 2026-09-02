# Copy into PR body after live test

## Ludwitt / Hult app ID

le_63324bac060ee6f7620206

## Production listing URL

https://dealforge-learn.vercel.app

## Integration evidence

**Sign-in (OAuth + PKCE):** Production → “Sign in with Ludwitt” → `/learn` shows signed-in email. Scopes: `profile credits:read credits:spend`.

**Events (BYOB):** Opening a lesson fires `lesson_started` (stored server-side + Vercel logs). Quiz submit fires `quiz_submitted`. `GET /api/events` returns session trail after activity.

**Credits / AI proxy:** `/api/credits` reads `spendableCents` from Ludwitt. Lesson “AI sales coach” calls `POST /api/v1/ai/messages` via `/api/coach` (402 handled with top-up link).

**Evidence:** [Screenshot of /learn + date + optional GET /api/events JSON after test]

## App summary

- **Name:** DealForge · **Topic:** B2B Enterprise Sales · **Tier:** BYOB (70% engineer share)
