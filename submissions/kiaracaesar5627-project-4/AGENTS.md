# AGENTS.md — Interview Room (Project 4 / Week 4)

## Goal

Ship a production **interview** learning app on Ludwitt/Hult with JWT launch and
event tracking. Product is job-application scenarios by role — not a generic
course site or algorithm textbook.

## Commands

```bash
npm install
npm run dev
npm run build
npm run smoke
```

## Key paths

- `src/lib/lessons.ts` — `JOB_TRACKS` (role → scenarios with interviewer + playbook)
- `src/lib/coach.ts` — coach system prompt + Anthropic/OpenAI/local personalizer
- `src/app/coach` · `src/app/api/coach/chat` — personalized interview chat
- `src/app/practice/[track]/[slug]` — scenario practice UI
- `src/lib/platform/**` — Ludwitt `/v1` surface
- `src/app/launch` — JWT gate

## Do not

- Drift back into algorithm-textbook framing
- Commit `.env.local` or API keys
- Invent external user counts