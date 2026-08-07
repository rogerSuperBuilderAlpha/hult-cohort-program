# AGENTS.md — Ludwitt/Hult API

Parent guide: [../../AGENTS.md](../../AGENTS.md)

## Purpose

Reference **Express** server for Phase 2 learning/venture apps: app registration, JWT launch tokens, event ingestion, user metrics snapshots. Spec in [openapi.yaml](openapi.yaml).

**This is a reference implementation, not a hosted service.** We run nothing at a public URL from this directory. Two integration paths are accepted — the hosted portal at [ludwitt.com/developers](https://www.ludwitt.com/developers) (gated; apps queue for review) or a self-run instance of this server. Read [README.md](README.md) before advising anyone on integration.

⚠️ **Never cite `api.ludwitt.hult` or `sandbox.api.ludwitt.hult`.** Those hosts do not exist and never have; the docs published them in error and the Summer Pilot cohort lost Week 4 hours to it. The store is also in memory, so registrations die with the process.

## Commands

```bash
npm install
npm test          # node --test tests/api.test.js
npm run dev       # node src/index.js
```

## Key files

| File | Role |
|------|------|
| `src/server.js` | Express routes |
| `src/store.js` | In-memory dev store (apps, developers, events) |
| `openapi.yaml` | Contract for platform integration |
| `DEVELOPER.md` | Student integration guide |
| `DEPLOY.md` | Deploy notes |

## Conventions

- ESM (`"type": "module"`)
- Auth: `Authorization: Bearer {api_key}` for developer routes
- JWT: HS256 with per-app `jwt_secret`
- Keep OpenAPI and implementation in sync when changing routes

## Related curriculum

- [curriculum/phase-2/project-1-learning-app/](../../curriculum/phase-2/project-1-learning-app/)
- [partnerships/ludwitt-hult-platform.md](../../partnerships/ludwitt-hult-platform.md)
