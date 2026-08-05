# [P2-L1] Submission — kiaracaesar5627

## Ludwitt/Hult app ID

`7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c`

## Production listing URL

https://kiaracaesar5627-project-4.vercel.app

Launch path: https://kiaracaesar5627-project-4.vercel.app/launch  
Practice room: https://kiaracaesar5627-project-4.vercel.app/practice  
Coach chat: https://kiaracaesar5627-project-4.vercel.app/coach

## Metrics API snapshot (date-stamped)

As of **2026-08-05T17:18:16.318Z** via `GET /v1/apps/7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c/metrics`:

- `unique_users`: 1
- `qualified_users`: 1

(Smoke external user after register → launch-token → `lesson_started` + `quiz_submitted`. ≥25 qualified users is a later platform snapshot gate, not a merge precondition.)

## Promotion channels used

- Integration smoke / reviewer launch-token flow
- Cohort Discord and personal outreach planned for the later adoption snapshot

## Notes

- App: **Interview Room** — 10 job tracks × 10 scenarios (100 questions) + AI coach chat (`/coach`) for personalized paths (Anthropic/OpenAI optional; local fallback always on)
- Path: `submissions/kiaracaesar5627-project-4`
- Platform API (OpenAPI-compatible): same origin `/v1/*`
- Health: https://kiaracaesar5627-project-4.vercel.app/health
- Example scenario: `/practice/software-engineer/missed-deadline`
