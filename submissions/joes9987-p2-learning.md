# Project 2 Learning — @joes9987 (EudaLearn)

Summer Pilot 2026 · Week 4 · Ludwitt learning integration

## Production URL

https://learn-joes9987.vercel.app

## Ludwitt Creator client / app ID

`le_d0e87dbc215bdf4d90eaa7`

Registered on Ludwitt Creator (BYOB tier). Creator settings: https://www.ludwitt.com/creator/apps/le_d0e87dbc215bdf4d90eaa7  
Status at submission update: **In review** (marketplace listing pending publish).

## Production listing URL

https://www.ludwitt.com/dashboard/marketplace/eudalearn

App URL (OAuth callbacks / practice): https://learn-joes9987.vercel.app

Curriculum host `api.ludwitt.hult` still does not resolve in DNS. **Identity + listing** use live Ludwitt Creator OAuth at `pitchrise.ludwitt.com`. **Learning-event / qualified-session telemetry** is app-owned via Supabase + `GET /api/platform/v1/apps/{app_id}/metrics` until an official Hult events API is available.

## Build repo

https://github.com/joes9987/learn-joes9987

## Integration evidence

| Check | Result |
|-------|--------|
| Creator registration | Client ID `le_d0e87dbc215bdf4d90eaa7`, slug `eudalearn`, category Learning, icon set, **submitted for review** |
| OAuth | `GET /api/auth/ludwitt` → `pitchrise.ludwitt.com/oauth/authorize` → `/auth/callback` → session cookie → `/learn` |
| AI / credits loop | Creator Test mode mint + `POST /api/v1/ai/messages` → 200 (`chargedCostCents: 0`, test mode). In-app coach: `POST /api/coach` |
| Events | Practice loop posts `lesson_started`, `quiz_submitted`, `lesson_completed` (+ optional heartbeats) |
| Health | https://learn-joes9987.vercel.app/api/health → `oauthConfigured: true`, `clientIdPresent: true` |

### Metrics API snapshot (date-stamped)

App-owned learning telemetry (not a substitute for Creator marketplace analytics):

```json
{
  "app_id": "le_d0e87dbc215bdf4d90eaa7",
  "unique_users": 1,
  "qualified_users": 1,
  "qualified_sessions": 1,
  "events": 3,
  "snapshot_at": "2026-08-05T17:52:58.657Z"
}
```

Pulled via `GET /api/platform/v1/apps/le_d0e87dbc215bdf4d90eaa7/metrics` after a non-cohort external test user completed a qualified session (non-heartbeat events).

## Promotion channels used

- Ludwitt marketplace listing: https://www.ludwitt.com/dashboard/marketplace/eudalearn
- EudaMarket suite deep link: https://showcase-joes9987.vercel.app/suite
- Public GitHub repo: https://github.com/joes9987/learn-joes9987
- Production app: https://learn-joes9987.vercel.app

## Notes

Week 4 merge bar is integration evidence (register → Ludwitt identity/launch → events → proof PR), not ≥25 external users. Adoption snapshot (≥25 qualified external users) remains the later program gate (~Aug 19). Promote the **marketplace listing URL**, not only the raw Vercel URL.

## OAuth authorize note (2026-08-05)

Ludwitt Creator apps currently receive `invalid_client` from `GET /api/oauth/authorize` and `POST /api/oauth/token` (reproduced with both `le_d0e87�` and a freshly registered second client). Creator **Mint test token** + `GET /api/oauth/userinfo` and `POST /api/v1/ai/messages` work. EudaLearn `/login` therefore supports Creator test-token session establishment while platform authorize is broken; OAuth redirect remains wired for when Ludwitt fixes client lookup.

