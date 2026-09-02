# Error Catalog

Every error response is JSON. Most have:
- `error` — short machine-readable code
- `error_description` — human-readable detail
- Sometimes `code` — additional structured code (e.g. `INSUFFICIENT_PAID_CREDITS`)
- Sometimes `details` — structured context (e.g. quotas, balances)

## OAuth errors

| HTTP | error | When |
|---|---|---|
| 400 | `invalid_request` | Missing parameter, malformed body, redirect_uri mismatch |
| 400 | `unsupported_response_type` | `response_type` is not `code` |
| 400 | `unsupported_grant_type` | `grant_type` is not `authorization_code` or `refresh_token` |
| 400 | `invalid_grant` | Auth code expired, replayed, redirect_uri mismatch, or refresh token revoked |
| 400 | `invalid_scope` | Requested scope your app didn't register |
| 400 | `invalid_client` | client_id unknown or app disabled |
| 401 | `invalid_client` | client_secret wrong |
| 401 | `invalid_token` | Access token expired, revoked, or wrong shape |
| 403 | `insufficient_scope` | Endpoint needs a scope not on this token |

## Credit errors (`/api/v1/ai/messages`)

| HTTP | error / code | When |
|---|---|---|
| 400 | `invalid_model` | Model id not in the allow-list |
| 400 | `invalid_request` | `messages` array missing or empty |
| 402 | `INSUFFICIENT_PAID_CREDITS` | User has no paid (Stripe-deposited) balance to spend |
| 503 | `service_unavailable` | Anthropic provider not configured / unreachable |

The 402 body:
```json
{
  "error": "insufficient_paid_credits",
  "error_description": "...",
  "code": "INSUFFICIENT_PAID_CREDITS",
  "details": {
    "paidBalanceCents": 0,
    "paidBalanceFormatted": "$0.00",
    "requiredCents": 1,
    "requiredFormatted": "$0.01",
    "topUpUrl": "/account/credits"
  }
}
```

## Hosted-data errors (`/api/v1/data/*`)

| HTTP | error / code | When |
|---|---|---|
| 400 | `invalid_request` + `invalid_collection` | Collection name fails regex or isn't declared on this app |
| 400 | `invalid_request` + `invalid_doc_id` | Doc id fails regex |
| 400 | `invalid_request` + `invalid_where` | `where=` field not in `indexedFields`, malformed, or oversized |
| 400 | `invalid_request` + `invalid_order_by` | `orderBy` field not allowed |
| 400 | `invalid_request` + `invalid_body` / `envelope` / `unserializable` | Body shape, depth-bomb, prototype-pollution, reserved key, etc. |
| 400 | `invalid_request` + `invalid_json` | Body is not valid JSON |
| 401 | `invalid_token` | Bearer missing, expired, or revoked |
| 401 | `access_revoked` | The user has revoked your app; data is in 30-day grace, not accessible |
| 403 | `hosted_storage_disabled` | Your app didn't opt into hosted storage at registration |
| 403 | `insufficient_scope` | Token lacks `data:read` or `data:write` |
| 404 | `not_found` | Document doesn't exist (or has expired via `_ttl`) |
| 412 | `precondition_failed` | `If-Match` ETag mismatch |
| 413 | `payload_too_large` (`content_length` or `doc_too_large`) | Body exceeds `maxDocBytes` |
| 413 | `quota_exceeded` (`maxBytesPerUser` or `maxDocCountPerUser`) | (App, user) has hit their cap |
| 429 | `rate_limited` | Too many requests in the rate-limit window |

## When in doubt

- **400** = your client did something wrong; fix and don't retry the same way
- **401** = re-auth (access token expired) or stop (revoked)
- **402** = user has to act (deposit credits)
- **403** = misconfigured app; check registration
- **404** = doc doesn't exist (this is normal for "first read")
- **412** = optimistic-concurrency conflict; re-read and retry
- **413** = too big or quota hit; surface to the user
- **429** = honor `Retry-After`
- **5xx** = our problem; retry with backoff
