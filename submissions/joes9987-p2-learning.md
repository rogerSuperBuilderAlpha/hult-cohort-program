# Project 2 Learning — @joes9987 (EudaLearn)

Summer Pilot 2026 · Week 4 · Ludwitt learning integration

## Production URL

https://learn-joes9987.vercel.app

## Ludwitt / Hult app ID

`f9a08a30-630d-41a2-90a1-4dc132cae8b4`

## Production listing URL

https://learn-joes9987.vercel.app/

(Curriculum host `api.ludwitt.hult` does not resolve in DNS yet. EudaLearn exposes a curriculum-compatible platform shim at `https://learn-joes9987.vercel.app/api/platform/v1` for launch-token, events, and metrics. Ludwitt developer portal: https://ludwitt.com/developers.)

## Build repo

https://github.com/joes9987/learn-joes9987

## Integration evidence

| Check | Result |
|-------|--------|
| JWT launch | `POST /api/platform/v1/auth/launch-token` → `/launch?token=` → session cookie → `/learn` |
| Events | Practice loop + platform events: `lesson_started`, `quiz_submitted`, `lesson_completed` (heartbeats optional) |
| Health | https://learn-joes9987.vercel.app/api/health → `app: "eudalearn"`, `ludwittConfigured: true` |

### Metrics API snapshot (date-stamped)

```json
{
  "app_id": "f9a08a30-630d-41a2-90a1-4dc132cae8b4",
  "unique_users": 1,
  "qualified_users": 1,
  "qualified_sessions": 1,
  "events": 3,
  "snapshot_at": "2026-08-05T16:52:17.081Z"
}
```

Pulled via `GET /api/platform/v1/apps/{app_id}/metrics` after a non-cohort external test user completed a qualified session (non-heartbeat events).

## Promotion channels used

- EudaMarket suite deep link: https://showcase-joes9987.vercel.app/suite
- Public GitHub repo + Vercel production URL
- Cohort-facing listing URL (this app) for launcher-style entry once official Ludwitt directory DNS is live

## Notes

Week 4 merge bar is integration evidence (register → JWT launch → events → proof PR), not ≥25 external users. Adoption snapshot remains a later program gate.
