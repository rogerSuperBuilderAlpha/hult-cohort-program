# Developer documentation (v0.1)

Base URL (local): `http://localhost:4000/v1`

## Quick start

```bash
cd execution/ludwitt-hult-api
npm install
npm run dev
```

Demo keys (seeded on startup):
- Sandbox: `sandbox_key_demo`
- Production: `prod_key_demo`

## 1. Register your app

```bash
curl -X POST http://localhost:4000/v1/developer/apps \
  -H "Authorization: Bearer prod_key_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Intro to FP&A",
    "description": "A learning app for financial planning and analysis professionals who want to automate reporting with modern tools and workflows.",
    "topic": "Finance",
    "launch_url": "https://your-app.vercel.app/launch",
    "repo_url": "https://github.com/you/fpa-learn"
  }'
```

Save `app_id`, `api_key`, `jwt_secret`.

## 2. Validate launch JWT in your app

Your app receives `?token=...` on launch. Verify with `jwt_secret`:

```js
import jwt from 'jsonwebtoken';
const payload = jwt.verify(token, process.env.LUDWITT_JWT_SECRET);
// { sub, email, app_id, iat, exp }
```

## 3. Record learning events

```bash
curl -X POST http://localhost:4000/v1/apps/{app_id}/events \
  -H "Authorization: Bearer prod_key_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "lesson_started",
    "user_id": "platform-user-uuid",
    "session_id": "session-uuid"
  }'
```

Events: `lesson_started`, `lesson_completed`, `quiz_submitted`, `session_heartbeat`

## 4. Check metrics

```bash
curl http://localhost:4000/v1/apps/{app_id}/metrics \
  -H "Authorization: Bearer prod_key_demo"
```

**Pass gate:** `qualified_users >= 25` at snapshot (see [metrics.md](../../assessment/metrics.md)).

## Anti-gaming

Cohort member user IDs and user_ids containing your GitHub handle are not counted.

## Admin snapshot

```bash
curl http://localhost:4000/v1/admin/cohorts/fall26/snapshots/2026-11-21 \
  -H "Authorization: Bearer dev-admin-key"
```

Returns CSV for PM platform import.

See [integration-spec.md](../../curriculum/phase-2/project-1-learning-app/integration-spec.md) for student-facing requirements.
