# P2-L1 PR body — @isaia1

Copy everything below this line into the GitHub PR description when you open the submission.

---

## Summary

Shipped **LearnHub** — a learning web app with courses, lessons, quizzes, flashcards, XP/streaks, and Ludwitt integration:

- **Sign in with Ludwitt** — OAuth 2.0 + PKCE; server-side token exchange (client secret never exposed to browser)
- **Credit balance** — Profile shows `spendableCents` from Ludwitt paid balance
- **AI Tutor** — Lesson pages call Ludwitt AI proxy (`/api/v1/ai/messages`) using user credits

Stack: Vite + React, deployed on Vercel.

## Ludwitt/Hult app ID

`le_c4ad1bb389677060475555`

## Production listing URL

https://learnhub-beak.vercel.app

Sign-in: https://learnhub-beak.vercel.app/login

## Integration evidence (sign-in or launch flow + events firing)

### Sign-in flow (OAuth + PKCE)

1. User clicks **Sign in with Ludwitt** on `/login`
2. Browser redirects to `https://pitchrise.ludwitt.com/oauth/authorize` with PKCE challenge
3. Ludwitt redirects back to `/auth/callback` with authorization code
4. Server exchanges code at `/api/oauth/token`, sets session cookie, loads user via `/api/oauth/userinfo`

### Non-heartbeat event (AI tutor)

**When:** Ludwitt user asks a question on a lesson page (AI Tutor panel)

**Call:** `POST /api/ludwitt/ai/messages` → Ludwitt `POST /api/v1/ai/messages` (credits charged per token usage)

**Evidence template** (fill after you test on production):

```
User: <ludwitt sub / email>
Timestamp: <ISO-8601>
Flow: OAuth sign-in completed
Event: AI tutor message sent on lesson page
Response: 200 with assistant content (or 402 if no paid credits)
```

## Agent usage

- Research: Ludwitt developer docs (OAuth, PKCE, credits, AI proxy)
- Dev: Ludwitt OAuth integration, HTTPS local dev, app icon, Vercel API routes
- QA: `npm run build`, local sign-in flow, credit balance + AI tutor smoke checks

## Test plan

- [ ] Open production URL https://learnhub-beak.vercel.app
- [ ] Sign in with Ludwitt on `/login`
- [ ] Confirm spendable credits on Profile
- [ ] Open a lesson → Ask AI Tutor a question
- [ ] Fresh clone: `npm install`, copy `.env.example`, `npm run build`
