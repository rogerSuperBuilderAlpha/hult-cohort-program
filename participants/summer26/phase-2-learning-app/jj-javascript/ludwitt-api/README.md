# Ludwitt/Hult Platform API — Cohort 1 MVP spec

Implementation target: **November 1, 2026** ([ludwitt-hult-platform.md](../../partnerships/ludwitt-hult-platform.md))

Student-facing integration: [integration-spec.md](../../curriculum/phase-2/project-1-learning-app/integration-spec.md)

---

## MVP scope

| Endpoint | Priority |
|----------|----------|
| `POST /v1/developer/apps` — register app | P0 |
| `POST /v1/auth/launch-token` — issue JWT for user+app | P0 |
| `POST /v1/apps/{app_id}/events` — learning events | P0 |
| `GET /v1/apps/{app_id}/metrics` — user count for snapshot | P0 |
| Developer docs site | P0 |
| Admin app review UI | P1 (manual SQL OK week 1) |

---

## Environment

| Env | Base URL |
|-----|----------|
| Sandbox | `https://sandbox.api.ludwitt.hult/v1` |
| Production | `https://api.ludwitt.hult/v1` |

---

## Auth

- Developer requests: `Authorization: Bearer {api_key}`
- Launch JWT: HS256 signed with per-app secret
- See [openapi.yaml](openapi.yaml)

---

## Event types

`lesson_started`, `lesson_completed`, `quiz_submitted`, `session_heartbeat`

Sandbox events prefixed `sandbox.*` — excluded from metrics.

---

## Snapshot export (admin)

`GET /v1/admin/cohorts/{cohort_id}/snapshots/{date}`

Returns CSV: `app_id, student_handle, unique_users, qualified_users`

Used for [metrics.md](../../assessment/metrics.md) pass gates.

---

## Build order

1. App registration + keys
2. Event ingestion + roster blocklist
3. Metrics aggregation
4. JWT launch flow
5. Docs + sandbox test accounts

OpenAPI: [openapi.yaml](openapi.yaml)
