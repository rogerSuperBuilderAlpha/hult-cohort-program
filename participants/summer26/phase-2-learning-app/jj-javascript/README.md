# Git Arcade

Gamified Git and terminal learning for the Hult Cohort Phase 2 Ludwitt integration project.

## Local setup

```bash
cd ludwitt-api && npm install && npm run dev   # :4000
cd app && npm install && cp .env.example .env.local
npm run dev                                     # :3000
```

Register against local API:

```bash
cd app && npm run register-app
```

Smoke test:

```bash
cd app && npm run smoke-test
```

## Ludwitt integration

- Self-hosted reference API (`ludwitt-api/`) — HS256 launch tokens
- `GET /launch?token=` validates JWT and sets session cookie
- Events: `lesson_started`, `quiz_submitted`, `lesson_completed`
- `POST /api/demo-launch` for anonymous peer entry

## Deploy

Two Vercel projects from `ludwitt-api/` and `app/`.
