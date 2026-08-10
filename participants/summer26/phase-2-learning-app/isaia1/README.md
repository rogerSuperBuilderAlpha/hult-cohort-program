# LearnHub

A learning website — courses, lessons, quizzes, flashcards, and progress tracking with XP and streaks. Supports **Sign in with Ludwitt** (OAuth + PKCE) and AI tutoring powered by Ludwitt credits.

## Run locally

```bash
npm install
cp .env.example .env
# Add LUDWITT_CLIENT_SECRET and SESSION_SECRET to .env
npm run dev
```

Open **https://localhost:3000** (local HTTPS dev server).

The browser will warn about the self-signed certificate the first time — click **Advanced → Proceed to localhost** to continue.

## Ludwitt integration

- OAuth callback: `https://localhost:3000/auth/callback`
- Server routes under `/api/auth/*` and `/api/ludwitt/*` (token exchange stays server-side)
- Offline Ludwitt docs live in `.ludwitt/` (gitignored; re-fetch from `https://pitchrise.ludwitt.com/docs/le/llms.txt`)

Set these in `.env` for local dev and in Vercel **Environment Variables** for production:

| Variable | Purpose |
|---|---|
| `LUDWITT_CLIENT_SECRET` | Server-only OAuth client secret |
| `SESSION_SECRET` | Encrypts Ludwitt session cookies |

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import [github.com/Isaia1/learnhub](https://github.com/Isaia1/learnhub) on [vercel.com](https://vercel.com)
2. **Root Directory:** `.` (repo root)
3. **Framework:** Vite · **Build:** `npm run build` · **Output:** `dist`
4. Add `LUDWITT_CLIENT_SECRET` and `SESSION_SECRET` env vars
5. Deploy

## Features

- Local sign up / sign in (browser localStorage) or Ludwitt OAuth
- Ludwitt spendable credit balance on Profile
- AI Tutor on lesson pages (Ludwitt users)
- 4 courses with lessons, quizzes, and flashcards
- XP, streaks, and per-course progress
