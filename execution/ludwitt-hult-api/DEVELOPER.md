# Developer quickstart (v0.2)

Integrating a learning app with the Ludwitt/Hult contract. Start with [README.md](README.md) if you have not yet chosen between the hosted platform and this reference API — that choice changes everything below.

**Base URL:** `<your-instance>/v1`. Locally, `http://localhost:4000/v1`. There is no `api.ludwitt.hult`; that hostname was published in error and has never resolved.

---

## 0. Before you register

The reference API stores everything in memory. **Restarting the server destroys your registration.** Deploy one instance and leave it running, or accept that you will re-register and update your pull request. See the warning in [README.md](README.md#-the-store-is-in-memory--read-this-before-you-register).

```bash
cd execution/ludwitt-hult-api
npm install
npm run dev
```

Seeded developer keys: `sandbox_key_demo`, `prod_key_demo`. Shared, not personal — see README.

---

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

Returns `app_id`, `api_key`, and `jwt_secret`. **Save all three now.** Put `app_id` in your PR body; put the two secrets in your host's environment, never in git.

Description must be at least 100 characters.

---

## 2. Validate the launch JWT

Your app receives `?token=…` on launch. Verify it with `jwt_secret`:

```js
import jwt from 'jsonwebtoken';
const payload = jwt.verify(token, process.env.LUDWITT_JWT_SECRET);
// { sub, email, app_id, iat, exp }
```

**Fail closed.** Reject expired or invalid tokens and show a "Launch from Ludwitt/Hult" message rather than letting the visitor in anonymously — an anonymous visitor produces no attributable events and counts for nothing. Fail closed when the secret or app ID is unset, too, so a misconfigured deploy is loud instead of silently open.

Setting an environment variable does not change a running deployment. **Redeploy after you set it**, then confirm the launch route no longer reports itself unconfigured.

---

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

Events: `lesson_started`, `lesson_completed`, `quiz_submitted`, `session_heartbeat`.

**At least one non-heartbeat event per session.** Heartbeats alone do not make a session qualify, so a user who idles on a page is not a user.

---

## 4. Check your counts

```bash
curl http://localhost:4000/v1/apps/{app_id}/metrics \
  -H "Authorization: Bearer prod_key_demo"
```

Watch this during the week rather than at the end. Silent event-wiring failures look identical to "nobody came" until you check.

---

## What the numbers gate

**Week 4 (learning app): no user-count condition.** Removed 2026-08-04. Build a registered, working, instrumented app; that is the bar.

**Week 5 (venture): ≥25 qualified external users**, from the platform snapshot ([metrics.md](../../assessment/metrics.md)).

### Anti-gaming

Cohort member user IDs do not count. Neither do user IDs containing your own GitHub handle. Dedupe by email. The roster blocklist in `src/store.js` currently holds placeholder IDs, so treat any count from a fresh instance as indicative rather than official.

---

## Admin snapshot (staff)

```bash
curl http://localhost:4000/v1/admin/cohorts/summer26/snapshots/2026-08-16 \
  -H "Authorization: Bearer dev-admin-key"
```

Returns CSV: `app_id, student_handle, unique_users, qualified_users`. This route is unauthenticated in the reference implementation — do not expose an instance you care about.

---

Student-facing requirements: [integration-spec.md](../../curriculum/phase-2/project-1-learning-app/integration-spec.md)
