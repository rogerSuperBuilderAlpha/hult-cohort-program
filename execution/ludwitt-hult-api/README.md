# Ludwitt/Hult Platform API — reference implementation

**Read this before you integrate anything.** This package is a *reference implementation* of the platform contract, not a hosted service. Nothing in this directory runs at a public URL that we operate.

> **Removed on 2026-08-07:** earlier versions of these docs published base URLs of `https://api.ludwitt.hult/v1` and `https://sandbox.api.ludwitt.hult/v1`. **Those hosts have never existed** — `.hult` is not a real top-level domain. Participants in the Summer Pilot lost hours of Week 4 to that mistake, some of them standing up their own copy of this server to have something to integrate against. If you find `.hult` in any doc, it is stale; report it.

---

## Which platform do I integrate with?

Two paths exist. **Both counted for Summer Pilot Week 4** (ruled 2026-08-07). Pick with open eyes.

`www.ludwitt.com` and `pitchrise.ludwitt.com` serve the **same deployment** (verified 2026-08-08: identical Vercel deployment id on both hosts). `/developers` is one portal reachable at either domain — they are not two systems, and an app registered through one is the same app at the other.

| | Hosted platform | Reference API (this package) |
|---|---|---|
| **Where** | https://www.ludwitt.com/developers (= pitchrise.ludwitt.com/developers) | Wherever you run it — localhost or your own deploy |
| **Registration** | Real developer portal, app queued for review | `POST /v1/developer/apps` against your instance |
| **App ID looks like** | `le_aa66000f7ab45563e7b4dd` | a UUID |
| **Auth** | OAuth 2.0 + PKCE | Bearer `api_key`, HS256 launch JWT |
| **API host** | `pitchrise.ludwitt.com` | your instance |
| **Catch** | Portal access is gated, and live OAuth stays off until staff approve your app | In-memory store — everything vanishes on restart |

**The hosted portal is gated.** At least one participant hit an "Unlock Developer Portal" wall demanding 5 ALC Projects (0/5) and Deployment Verified (0/1), with a **$10,000 bypass** offered as the alternative. **Do not pay it.** If the portal will not open for you, say so in your pull request and in Discord, and use the reference API instead. That is an accepted path, not a fallback you will be penalised for.

If the portal *does* open, expect your app to sit "In review" before live OAuth works. Verify through Test Mode meanwhile and document what Test Mode did and did not prove.

---

## Running the reference API

```bash
cd execution/ludwitt-hult-api
npm install
npm run dev          # http://localhost:4000
curl http://localhost:4000/health
```

Base URL is `<your-instance>/v1`. Locally that is `http://localhost:4000/v1`.

### ⚠ The store is in memory — read this before you register

`src/store.js` keeps developers, apps, and events in plain `Map`s. **Stop the process and every registration and event is gone.** Your `app_id`, `api_key`, and `jwt_secret` become orphans, and re-registering mints a different `app_id` than the one in your pull request.

Three habits that avoid the pain:

1. **Deploy one long-lived instance** rather than re-running it locally. A Summer Pilot participant ran theirs on Vercel and it held up fine for the week — see [DEPLOY.md](DEPLOY.md).
2. **Record `app_id`, `api_key`, and `jwt_secret` the moment registration returns them.** Put the app ID in your PR body and the secrets in your host's environment variables, never in git.
3. **If your instance restarts, re-register and update the app ID in your PR in place.** Say that you did. Staff would rather read an honest note than chase a dead identifier.

### Seeded developer keys are shared, not personal

A fresh instance seeds two developer keys: `sandbox_key_demo` and `prod_key_demo`. They authenticate the `/v1/developer/*` routes. They are **not** per-student credentials — on a shared instance everyone holds the same key and can see each other's apps. Fine for a pilot; do not treat either as a secret or as proof of identity.

---

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/developer/apps` | Register an app → `app_id`, `api_key`, `jwt_secret` |
| `POST /v1/auth/launch-token` | Issue a launch JWT for a user + app |
| `POST /v1/apps/{app_id}/events` | Ingest learning events |
| `GET /v1/apps/{app_id}/metrics` | Unique and qualified user counts |
| `GET /v1/admin/cohorts/{cohort_id}/snapshots/{date}` | CSV export for staff |
| `GET /health` | Liveness |

All `/v1` routes except `/health` require `Authorization: Bearer {api_key}`. Launch JWTs are HS256, signed with the app's own `jwt_secret`. Contract: [openapi.yaml](openapi.yaml).

**Event types:** `lesson_started`, `lesson_completed`, `quiz_submitted`, `session_heartbeat`.

A user producing only heartbeats does not qualify. At least one non-heartbeat event per session is what makes a session count.

---

## What the user count does and does not gate

**Week 4 (learning app) has no user-count condition.** It was removed on 2026-08-04. The ≥25 figure came from the original eight-week calendar, where the learning app sat in week 6 with a snapshot on Fri Aug 19 — carrying it onto a six-day build week turned a two-and-a-half-week adoption target into an impossible one. Week 4's bar is the integration: a registered app, a working launch flow, events landing.

**Week 5 (venture) does carry a ≥25 external-user gate**, measured from the platform snapshot. See [assessment/metrics.md](../../assessment/metrics.md) and [assessment/pass-fail.md](../../assessment/pass-fail.md).

Cohort members do not count toward anyone's total, and neither do user IDs containing your own GitHub handle. `src/store.js` carries a roster blocklist for this; it ships with placeholder IDs and needs the real roster loaded before any snapshot is treated as authoritative.

---

## Status and gaps

This is pilot-grade. Known gaps, stated so nobody plans around them:

- **No persistence.** In-memory only.
- **No per-student credentials.** Shared seeded developer keys.
- **Roster blocklist is a placeholder** (`cohort-member-1`, `cohort-member-2`).
- **No directory listing.** The app directory referenced in the student integration spec does not exist here; a "production listing URL" means your own deployed app URL.
- **Admin snapshot route is unauthenticated** in this implementation. Do not expose an instance you care about.

Student-facing integration steps: [integration-spec.md](../../curriculum/phase-2/project-1-learning-app/integration-spec.md) · Deploying: [DEPLOY.md](DEPLOY.md) · Quickstart: [DEVELOPER.md](DEVELOPER.md)
