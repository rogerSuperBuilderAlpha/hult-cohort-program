# cEAL Green RFP Learner — Ludwitt learning app

Week 4 submission for `@ryanroper79-alt`. Review won/lost Request for Proposals, analyze strategic inclusions, and surface agent recommendations to reach a **10% portfolio win rate**.

## Setup

```bash
cd participants/summer26/phase-2-learning-app/ryanroper79-alt
cp .env.example .env.local
npm install
```

Start Ludwitt API (separate terminal):

```bash
cd execution/ludwitt-hult-api && npm run dev
```

Register and run:

```bash
npm run register-app
npm run dev
npm run smoke-test
```

## Features

- **RFP case library** — 6 cEAL Green submissions (won + lost) with strategic inclusions
- **Win/loss analysis** — debrief factors and agent takeaways per case
- **Agent recommendations** — patterns from wins, lessons from losses, next-draft checklist
- **Ludwitt integration** — JWT launch + `lesson_started` / `quiz_submitted` / `lesson_completed` events

Replace sample data in `lib/rfp-cases.ts` with firm RFP records when available.

## Deploy

Production: https://ryanroper79-alt.vercel.app

Vercel root: `participants/summer26/phase-2-learning-app/ryanroper79-alt`
