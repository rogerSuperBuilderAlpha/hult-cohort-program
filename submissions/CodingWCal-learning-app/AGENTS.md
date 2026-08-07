# AGENTS.md

## Commands

- `npm run lint` — ESLint (0 errors expected)
- `npx tsc --noEmit` — typecheck (0 errors expected)
- `npm run build` — production build
- `npm run dev` — local dev server on http://localhost:3000

## Architecture

- App Router + `force-dynamic` on session-gated routes (`/dashboard`, `/learn/...`)
- Session auth: launch token verified in `app/launch/route.ts`, HttpOnly cookie `ai-onramp-session` (24h)
- Events: client `EventTracker` -> `POST /api/events` (session-gated) -> Ludwitt/Hult events API
- All course content lives in `lib/content.ts` (modules, lessons, quizzes)

## Conventions

- TypeScript strict; no `any` unless unavoidable
- Server-side code only in `lib/` and route handlers; client components under `components/` with `"use client"`
- Never commit `.env*` files — use `.env.local.example` for documented vars
- Keep the event payload schema in sync with the Ludwitt/Hult API contract (`event`, `user_id`, `session_id`, `metadata`)
