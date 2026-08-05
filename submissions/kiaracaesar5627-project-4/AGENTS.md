# AGENTS.md — Pattern Forge (Project 4 / Week 4)

## Goal

Ship a production learning app registered on Ludwitt/Hult with JWT launch and
event tracking. Week 4 merge bar = integration working (no user-count gate).

## Commands

```bash
npm install
npm run dev
npm run build
npm run smoke
```

## Key paths

- `src/lib/lessons.ts` — curriculum
- `src/lib/platform/store.ts` — Ludwitt in-process store + seeded app
- `src/app/api/v1/**` — OpenAPI-compatible platform surface (rewritten from `/v1`)
- `src/app/launch` — JWT gate
- `src/app/api/track` — session events

## Do not

- Commit `.env.local` or secrets beyond the documented demo keys
- Invent external user counts — metrics come from `GET /v1/apps/{id}/metrics`
