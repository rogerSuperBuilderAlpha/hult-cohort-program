# AGENTS.md — Interview Room (Project 4 / Week 4)

## Goal

Ship a production **interview** learning app on Ludwitt/Hult with JWT launch and
event tracking. Product is mock-interview rounds — not a generic course site.

## Commands

```bash
npm install
npm run dev
npm run build
npm run smoke
```

## Key paths

- `src/lib/lessons.ts` — interview rounds (behavioral / coding / design / closing)
- `src/app/practice/**` — practice room UI
- `src/lib/platform/**` — Ludwitt `/v1` surface
- `src/app/launch` — JWT gate

## Do not

- Drift back into algorithm-textbook framing
- Commit `.env.local`
- Invent external user counts
