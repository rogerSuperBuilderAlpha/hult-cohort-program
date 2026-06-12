# Ludwitt/Hult integration spec (student-facing)

**Purpose:** How students build and integrate learning apps for Phase 2 Project 1. Platform architecture in [ludwitt-hult-platform.md](../../../partnerships/ludwitt-hult-platform.md).

---

## Integration checklist

1. Register app → get `app_id`, `api_key`, `jwt_secret`
2. Implement launch endpoint that validates platform JWT
3. POST learning events to platform API
4. Submit for review → listing in directory
5. Promote externally — users must enter via platform launcher for counted metrics

---

## JWT launch flow

```
User clicks app in Ludwitt/Hult launcher
  → Platform redirects to: https://your-app.vercel.app/launch?token={JWT}
  → Your app validates JWT with jwt_secret
  → Extract user_id, email, app_id
  → Start learning session; fire events
```

### JWT payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "app_id": "app-uuid",
  "iat": 1234567890,
  "exp": 1234571490
}
```

Reject expired or invalid tokens → show "Launch from Ludwitt/Hult" message.

---

## Events API

```
POST https://api.ludwitt.hult/v1/apps/{app_id}/events
Authorization: Bearer {api_key}
Content-Type: application/json
```

| Event | When to fire |
|-------|--------------|
| `lesson_started` | User begins a lesson/module |
| `lesson_completed` | User finishes |
| `quiz_submitted` | User submits quiz |
| `session_heartbeat` | Every 60 sec during active session |

**Minimum for pass:** App must fire ≥ 1 non-heartbeat event per user session.

---

## App directory metadata

Submitted at registration:

| Field | Required |
|-------|----------|
| `title` | Yes |
| `description` | Yes (≥ 100 chars) |
| `topic` | Yes (e.g. "SQL for analysts") |
| `icon_url` | Yes (square PNG) |
| `launch_url` | Yes |
| `repo_url` | Yes (public GitHub) |

---

## Testing

1. Use sandbox keys in dev
2. Platform provides test user accounts (10 synthetic users)
3. Submit screen recording of learning flow + event log for review

---

## User count (your metric)

**You do not self-count.** Platform exports official count at snapshot ([metrics.md](../../../assessment/metrics.md)):

- **≥ 25 unique external users** by Fri Nov 21, 2026

Promote the **platform listing URL**, not raw Vercel URL, so users are authenticated and counted.

---

## Open decisions

None — follows platform architecture in ludwitt-hult-platform.md.

## Depends on

- [../../../partnerships/ludwitt-hult-platform.md](../../../partnerships/ludwitt-hult-platform.md)
- [promotion-playbook.md](promotion-playbook.md)
