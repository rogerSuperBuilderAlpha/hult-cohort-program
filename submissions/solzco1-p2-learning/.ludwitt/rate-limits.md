# Rate Limits

Limits are per-(app, user) — your app's traffic for one user is rate-limited
independently of your traffic for another user.

## Limits

| Endpoint group | Limit |
|---|---|
| `GET /api/v1/data/:collection/:docId` and `GET /api/v1/data/_meta/usage` | **300 requests/min** |
| `PUT /api/v1/data/:collection/:docId`, `DELETE /api/v1/data/:collection/:docId` | **60 requests/min** |
| `GET /api/v1/data/:collection` (list) | **60 requests/min** |
| `POST /api/v1/ai/messages` | shared 20/min/user across the platform |
| OAuth endpoints (`/api/oauth/*`) | shared 100/min/user |

Limits use a sliding window — a sustained 60/min on writes is OK; a 60-burst
followed by another 60 within 60 seconds will start returning 429s halfway
through the second burst.

## Headers

Every successful response includes:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1735689600000        # epoch ms when the window resets
```

A 429 response also includes:

```
Retry-After: 23                         # seconds
```

## Body of a 429

```json
{
  "error": "rate_limited",
  "error_description": "too many requests for this app on this user",
  "retryAfter": 23
}
```

## Recommended client behavior

- **Read `X-RateLimit-Remaining`** on success and back off proactively when
  it gets low. Don't wait for 429s if you can avoid them.
- **Honor `Retry-After`** on 429. Exponential backoff with jitter is fine
  but never retry sooner than the value tells you.
- **Don't burst on user actions.** A user clicks "Save"; you write one
  document. If you need to write 50 documents, batch them client-side first
  or stagger writes.
- **Cache reads.** Responses include an ETag — store it and conditional-GET
  with `If-None-Match` (returns 304 with no body when unchanged; coming
  in v2). For now, cache by ETag on your side.

## What about per-app aggregate limits?

There's no public per-app aggregate cap today — but we reserve the right
to add one if your traffic patterns threaten platform stability. If you
expect more than 10k requests/min sustained across all your users, get
in touch.
