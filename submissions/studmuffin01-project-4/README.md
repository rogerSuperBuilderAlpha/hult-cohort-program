# Prompt Like a Pro: The SCORE Method for Copilot

Week 4 Ludwitt learning app (`phase-2-learning-app`) — workspace folder `studmuffin01-project-4`.

Mini-course (~60 min) teaching **SCORE** as a diagnostic for professional prompting (managers, analysts, engineers, commercial/legal-adjacent roles). In-app AI examples are **static sample replies**; learners can use their own Copilot/ChatGPT for live checks.

## Live

| | |
|--|--|
| **Production** | https://prompt-like-a-pro-red.vercel.app |
| **Launch** | https://prompt-like-a-pro-red.vercel.app/launch |
| **Submission PR** | https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/274 |

## Stack

- Next.js 16 (App Router) + TypeScript
- Custom CSS in `app/globals.css` (Tailwind 4 is installed for preflight; almost no utility classes)
- `jose` for Ludwitt launch JWT (HS256)

## Hero image

The home hero expects `public/images/score-goal.png` (ball framed on the right; copy on the left). If missing after clone:

```bat
scripts\install-hero.cmd
```

Prefer committing that PNG into the repo so Vercel deploys include it.

## Local setup

```bash
cd submissions/studmuffin01-project-4
npm install
copy .env.example .env.local   # Windows
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With `ALLOW_DEV_BYPASS=true` (default in `.env.example`), visit `/launch` and use **Start locally** to walk the course without Ludwitt keys.

## Ludwitt / Hult integration

Step-by-step (register → env → ping → mint token → Vercel): **[LUDWITT.md](LUDWITT.md)**

| Piece | Behavior |
|-------|----------|
| `/launch?token=` | Verifies HS256 JWT → session cookie → Module 01 |
| Bad/missing token | Shows **Launch from Ludwitt/Hult** |
| `/api/events` | Forwards `lesson_started` / `lesson_completed` / `quiz_submitted` / `session_heartbeat` |
| No API keys | Events **dry-run** to the server console |
| `node scripts/mint-launch-token.mjs` | Local test launch URL using `.env.local` |

**Local:** checklist at http://localhost:3000/integration  

**Production Vercel:** set `LUDWITT_APP_ID`, `LUDWITT_API_KEY`, `LUDWITT_JWT_SECRET`, a **public** `LUDWITT_API_BASE_URL` (not localhost), `NEXT_PUBLIC_APP_URL=https://prompt-like-a-pro-red.vercel.app`, and `ALLOW_DEV_BYPASS=false`. Redeploy after env changes.

## Course content

Source of truth: [`content/course.ts`](content/course.ts) (modules + durations), quizzes in [`content/lesson-quizzes.ts`](content/lesson-quizzes.ts), baseline scenario in [`content/baseline-assessment.ts`](content/baseline-assessment.ts).

## Submission PR (program)

- Title: `[P2-L1] Submission — studmuffin01`
- Base: `projects/summer26/phase-2-learning-app`
- Head: `participants/summer26/phase-2-learning-app/studmuffin01`
- Include: Ludwitt app ID, listing URL, integration evidence, metrics snapshot when available
- Open PR: https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/pull/274

## Scripts

| Command | Purpose |
|----------------|----------------|
| `npm run dev` | Local server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `node scripts/register-ludwitt-app.mjs` | Register on local Ludwitt API |
| `node scripts/mint-launch-token.mjs` | Mint local `/launch?token=` URL |
