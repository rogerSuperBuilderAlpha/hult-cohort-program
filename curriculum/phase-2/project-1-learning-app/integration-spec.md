# Ludwitt/Hult integration spec (student-facing)

**Purpose:** How students build and integrate learning apps for Phase 2 Project 1. Platform architecture in [ludwitt-hult-platform.md](../../../partnerships/ludwitt-hult-platform.md).

> **`{platform_base_url}` is not a placeholder we forgot to fill.** Two platforms are accepted and their hosts differ — the hosted portal at [ludwitt.com/developers](https://www.ludwitt.com/developers), or your own instance of the reference API. **Pick one first**, from [execution/ludwitt-hult-api/README.md](../../../execution/ludwitt-hult-api/README.md), then substitute its base URL throughout. Earlier drafts of this file hard-coded `https://api.ludwitt.hult`, which has never existed and cost the Summer Pilot cohort real time in Week 4.

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
POST {platform_base_url}/v1/apps/{app_id}/events
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

1. Use the seeded developer keys in dev (`sandbox_key_demo` / `prod_key_demo` on the reference API — shared, not personal)
2. Mint your own test users. **The "10 synthetic user accounts" described in earlier drafts do not exist** in either platform; issue launch tokens for user IDs you control instead
3. Capture the learning flow and event log as evidence in your pull request

---

## User count (your metric)

**You do not self-count.** The platform exports the official count at snapshot ([metrics.md](../../../assessment/metrics.md)).

**Which week the count gates depends on the calendar you are running.** In the original eight-week programme the learning app sat in week 6, with a ≥25 external-user snapshot on Fri Aug 19. The compressed **Summer Pilot moved the learning app to Week 4 and carries no user-count condition there** — that gate was removed on 2026-08-04, because a two-and-a-half-week adoption target does not fit a six-day build week. The pilot's ≥25 gate lands on **Week 5 (venture)** instead. Check [content/program.ts](../../../execution/marketing/site/content/program.ts) for the week you are actually in; it is the source of truth over this file.

Promote the **platform listing URL**, not raw Vercel URL, so users are authenticated and counted.

---

## Open decisions

None — follows platform architecture in ludwitt-hult-platform.md.

## Depends on

- [../../../partnerships/ludwitt-hult-platform.md](../../../partnerships/ludwitt-hult-platform.md)
- [promotion-playbook.md](promotion-playbook.md)
