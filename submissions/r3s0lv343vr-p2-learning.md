# [P2-L1] Submission — r3s0lv343vr

**AI Investment Learning Simulator** — quest-style investing lab integrated with Ludwitt Creator (hosted storage).

## Ludwitt/Hult app ID

`le_b752d5261268d3c7607fa2`

## Production listing URL

https://ai-investment-learning-r3s0lv343vr.vercel.app

- Build repo: https://github.com/r3s0lv343vr/Learning-engineer-integration-to-Ludwitt (`main`)
- Health: `GET /api/health` → `ludwittConfigured: true`, `appId: le_b752d5261268d3c7607fa2`
- Demo entry (no Ludwitt login required for peer review): `/api/demo-launch`
- Ludwitt OAuth: `/auth/login` → `pitchrise.ludwitt.com/oauth/authorize` → `/auth/callback`

## Product summary

Warrior-on-a-map learning experience (Duolingo-like progression + Zelda-like quest map) teaching finance from the uploaded AI Investment Simulator syllabus:

- 18 syllabus module quests + Portfolio Lab ($14,800 starting capital)
- Hearts (start 5; +1 per 5 correct; −1 per 4 wrong streak) and Detention remediation
- Gold bars + 12+ side quests + wealth chests (3 / 5 / 10 gold)
- Stock + forex candle charts, curated/near-real financial news, simulated market events
- Add/remove portfolio assets
- Ludwitt hosted-data collections: `progress`, `portfolio`, `sessions`, `event_log`

## Integration evidence (launch flow + events firing)

### OAuth launch (Ludwitt Creator)

Verified production redirect:

```text
GET /auth/login
→ 307 Location: https://pitchrise.ludwitt.com/oauth/authorize?client_id=le_b752d5261268d3c7607fa2&redirect_uri=https%3A%2F%2Fai-investment-learning-r3s0lv343vr.vercel.app%2Fauth%2Fcallback&response_type=code&scope=profile+credits%3Aread+data%3Aread+data%3Awrite&state=…
```

Callback exchanges code server-to-server (`POST /api/oauth/token`), reads `GET /api/oauth/userinfo`, writes hosted-data docs, then starts a quest session.

### Demo launch + non-heartbeat events (2026-08-09)

```text
GET /api/demo-launch → /map (session cookie)
POST /api/events { "type": "quiz_submitted", ... } → 200
GET /api/events → session trail includes:
  session_started → lesson_started → quiz_submitted
```

Sample event payload (production):

```json
{
  "ok": true,
  "event": {
    "type": "quiz_submitted",
    "sessionId": "7339ff7a-a0e2-4430-91bc-eaa0199c430a",
    "userId": "demo-ca4f5fc0",
    "metadata": { "moduleId": "m1", "questionId": "m1-q1", "correct": true },
    "createdAt": "2026-08-09T19:44:28.940Z"
  }
}
```

Health check:

```json
{
  "ok": true,
  "app": "ai-investment-learning-simulator",
  "ludwittConfigured": true,
  "appId": "le_b752d5261268d3c7607fa2"
}
```

## Promotion channels used

- Ludwitt marketplace listing (slug `ai-investment-learning-simulator`; listing goes live after Ludwitt app review)
- Hult cohort Slack/Discord peer share
- LinkedIn post naming the app

## Metrics API snapshot date

2026-08-30 (planned platform snapshot date per participant)

## Agent usage

- Research: Phase 2 integration spec, Ludwitt Creator OAuth + hosted-data docs, peer P2-L1 PRs, uploaded syllabus
- Dev: Next.js quest app, game rules, syllabus content, OAuth/callback, hosted-data writes, Vercel production deploy
- QA: `npm run typecheck` / `test` / `build`; production smoke for health, demo launch, OAuth authorize redirect, event POST/GET

## Fresh-clone setup

```bash
git clone https://github.com/r3s0lv343vr/Learning-engineer-integration-to-Ludwitt.git
cd Learning-engineer-integration-to-Ludwitt
npm install
cp .env.example .env.local   # add Ludwitt + SESSION_SECRET
npm run dev
```

## Ludwitt Creator integration prompt (hosted-storage) — completed

Implemented against Ludwitt's generated integration prompt:

1. Docs ingested at `.ludwitt/` in the build repo
2. Sign in with Ludwitt → authorize with scopes `profile credits:read credits:spend data:read data:write`
3. Callback verifies `state`, exchanges code server-to-server, stores access + refresh tokens (httpOnly sealed cookie), reads userinfo (`sub`)
4. Token refresh before expiry (single-use refresh rotation)
5. Hosted-data sync for declared collections: `progress`, `portfolio`, `sessions`, `event_log`
6. AI mentor via `POST /api/v1/ai/messages` (`POST /api/ai/mentor`), gated on `spendableCents`, handles HTTP 402 `INSUFFICIENT_PAID_CREDITS`
7. Credits badge via `GET /api/v1/credits/balance` (`GET /api/credits`)

Production verify (2026-08-09 redeploy):

```text
GET /auth/login → scope includes credits%3Aspend
GET /api/health → ludwittConfigured:true
```
