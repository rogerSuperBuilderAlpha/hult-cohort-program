# Phase 2 Learning App Submission — @raven-dubgub

**Joshua Scotland** · Hult Cohort Developer Program · Summer 2026 · Week 4 (`phase-2-learning-app`)

**Production listing URL:** https://learning-raven-dubgub.vercel.app  
**Repo:** https://github.com/RAVEN-dubgub/learning-raven-dubgub  
**Integration notes:** [INTEGRATION.md](https://github.com/RAVEN-dubgub/learning-raven-dubgub/blob/main/INTEGRATION.md)

## Production listing URL

https://learning-raven-dubgub.vercel.app

Per Ludwitt cohort clarification: this Vercel URL is the production listing URL (no Ludwitt app directory entry).

## Ludwitt / PitchRise app ID

Reference API app registration (embedded — developer portal blocked, **no ALC $10k bypass**):

| Field | Value |
|-------|-------|
| `app_id` | `5867b2b9-4e23-47e1-87ae-77cd337c2d69` |
| Metrics endpoint | `GET https://learning-raven-dubgub.vercel.app/api/metrics` |
| Launch URL | `https://learning-raven-dubgub.vercel.app/launch` |

## Integration route

**Dual integration (both cohort-accepted routes):**

1. **PitchRise documented API** — `https://pitchrise.ludwitt.com/api/`
   - Firebase ID token in `Authorization` header
   - `GET /auth/me`, `GET /integrations`, `POST /webhooks` for learning events
   - Read `llms.txt` + `llms-full.txt` before build

2. **Cohort reference API (embedded)** — used because Ludwitt developer portal / ALC OAuth path was not accessible without paid bypass
   - JWT launch at `/launch?token=`
   - Events: `lesson_started`, `lesson_completed`, `quiz_submitted`
   - Metrics snapshot at `/api/metrics`

## Metrics API snapshot (date-stamped)

Captured **2026-08-08T21:06:12Z** from production (agent re-verified same day):

**Ops (Aug 8):** Secret scan alert #1 **resolved** (`.env.example` placeholder on `main` `3833596`). Peer-review fixes pushed on pm #7/#8, comms #13, showcase #13. Showcase `preview/holoframe-bg-center` merged to `main` + prod redeploy.

```json
{
  "app_id": "5867b2b9-4e23-47e1-87ae-77cd337c2d69",
  "production_listing_url": "https://learning-raven-dubgub.vercel.app",
  "integration_route": "PitchRise documented API + embedded cohort reference API (developer portal blocked — no ALC bypass)",
  "pitchrise_api_health": { "status": "ok" },
  "metrics": {
    "unique_users": 2,
    "qualified_users": 2,
    "snapshot_at": "2026-08-08T21:06:12.505Z"
  }
}
```

Qualified users will increase as external learners complete lessons (pass gate ≥25 by snapshot deadline).

## Promotion channels used

- Cohort GitHub submission PR (this PR)
- Share production URL with peers / external learners
- Planned: LinkedIn + cohort comms once Firebase sign-in verified by Joshua

## Summary

**Agent Git Lab** — five-lesson path on Git & GitHub for agent-first developers:

| Requirement | Shipped |
|-------------|---------|
| Production learning app | Yes — Next.js 16 on Vercel |
| Ludwitt integration | PitchRise Firebase + webhooks + embedded reference API |
| JWT / launch flow | `/launch?token=` validates reference JWT |
| Event tracking | `lesson_started`, `quiz_submitted`, `lesson_completed` |
| Instrumentation dashboard | `/dashboard` + `/api/metrics` |
| No ALC bypass | Confirmed — reference API only |

## Architecture

Next.js 16 · Prisma · Neon · Firebase Auth (PitchRise `pitch-rise` project) · Vercel

```
Browser → Next.js (Vercel) → Neon (progress + reference events)
              │
              ├─ POST pitchrise.ludwitt.com/api/webhooks (Firebase token)
              └─ GET pitchrise.ludwitt.com/api/auth/me (Firebase token)
```

## Agent usage

- Researched program spec, `llms.txt`, `llms-full.txt`, cohort `integration-spec.md`
- Scaffolded `learning-raven-dubgub`; Neon project `learning-raven-dubgub`; Vercel prod deploy
- Embedded reference API because developer portal returned 404 (no paid ALC bypass)
- QA: production homepage 200, `/api/metrics` returns app_id + snapshot

## How to review

1. Open https://learning-raven-dubgub.vercel.app
2. Sign in at `/login` (PitchRise Firebase — create account if needed)
3. Complete `/learn/why-git-exists` — confirm integration log shows events
4. Check `/dashboard` and `GET /api/metrics` for app id + snapshot
5. Skim repo `INTEGRATION.md`

## Known limitations

- `qualified_users` is 2 at Aug 8 snapshot — external promotion still in progress toward ≥25 pass gate
- PitchRise `/webhooks` requires authenticated Firebase session; unsigned sessions still record reference API events
- Developer portal OAuth path not used (blocked / no $10k bypass)

## Test plan

- [x] Production URL returns 200
- [x] `/api/metrics` returns app_id + date-stamped snapshot
- [x] PitchRise `/api/health` reachable from app
- [x] Reference API registration auto-created on first metrics call
- [ ] Joshua: Firebase sign-in smoke test on production
- [ ] External user promotion toward ≥25 qualified users (2 qualified at Aug 8 snapshot)
