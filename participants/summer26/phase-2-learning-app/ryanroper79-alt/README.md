# Climate Skills for Builders — Ludwitt learning app

Week 4 submission for `@ryanroper79-alt`. Three micro-lessons on carbon literacy, green software, and climate communications with Ludwitt/Hult JWT launch and event tracking.

## Setup

```bash
cd participants/summer26/phase-2-learning-app/ryanroper79-alt
cp .env.example .env.local
npm install
```

Start the Ludwitt/Hult API (separate terminal):

```bash
cd execution/ludwitt-hult-api
npm install
npm run dev
```

Register the app and write credentials to `.env.local`:

```bash
npm run register-app
npm run dev
```

## Verify integration

```bash
npm run smoke-test
```

Expects: launch JWT validates, session cookie set, `quiz_submitted` event accepted, metrics API returns qualified users.

## Deploy

Set Vercel root directory to `participants/summer26/phase-2-learning-app/ryanroper79-alt` and configure:

- `LUDWITT_APP_ID`
- `LUDWITT_API_KEY`
- `LUDWITT_JWT_SECRET`
- `LUDWITT_API_BASE_URL`

Re-run `npm run register-app` with `APP_PRODUCTION_URL` set to the production HTTPS URL after first deploy.
