# Ludwitt Learning Engineer — Quickstart

Build an app that students sign into with their Ludwitt account, spend their
Ludwitt credits inside, and (optionally) lets Ludwitt host the app's data.

## Two integration tiers

| Tier | What Ludwitt provides | Engineer revenue share | Pick when |
|---|---|---|---|
| **BYOB** (bring your own backend) | OAuth identity + AI proxy that bills the user's credits | **70%** of every credit charge | You already have a backend you want to keep using |
| **Hosted-data** | OAuth + credit billing + a JSON document store at `/api/v1/data/*` | **35%** of every credit charge | You want zero-backend deployment; pay for it with revenue share |

Pick at app registration. **Tiers are locked at creation** — to switch, register a new app.

## What's stable, what's still moving

- ✅ OAuth 2.0 + PKCE, refresh tokens, scope-gated access
- ✅ Paid-credit-only spend (free / trial / promo credits not spendable in third-party apps)
- ✅ Hosted-data CRUD + simple equality filters + pagination + TTL
- ✅ Per-(app, user) quotas and rate limits
- ✅ Audit log per CRUD call
- ⚠️  Webhooks, cross-user queries, binary uploads, range filters: **not in v1**
- ⚠️  Engineer-side analytics on stored data: not yet exposed (we have the data; the UI isn't built)

## Five-minute path to a working integration

1. **Register the app** at `https://pitchrise.ludwitt.com/learning-engineers/apps/new`. Pick BYOB or hosted-data. Copy the client secret — you'll only see it once.
2. **Implement OAuth callback.** Redirect users to `/oauth/authorize?...`, exchange the returned `code` for tokens at `/api/oauth/token`. See `oauth.md`.
3. **Spend credits** by proxying AI calls through `POST /api/v1/ai/messages`. See `credits.md` — note especially the difference between `balanceCents` and `spendableCents`.
4. **(Hosted-data only)** Read/write user data via `PUT/GET/DELETE /api/v1/data/:collection/:docId`. See `data-api.md`.
5. **Handle the error catalog** so users get good messages on the failure modes you don't control (402 insufficient credits, 413 quota exceeded, 429 rate limited, 401 revoked). See `errors.md`.

## URLs at a glance

```
Authorize (browser):           https://pitchrise.ludwitt.com/oauth/authorize
Token (server-to-server):      https://pitchrise.ludwitt.com/api/oauth/token
Userinfo:                      https://pitchrise.ludwitt.com/api/oauth/userinfo
Token revoke (RFC 7009):       https://pitchrise.ludwitt.com/api/oauth/revoke

Credit balance:                https://pitchrise.ludwitt.com/api/v1/credits/balance
AI messages (Anthropic proxy): https://pitchrise.ludwitt.com/api/v1/ai/messages

Hosted-data CRUD:              https://pitchrise.ludwitt.com/api/v1/data/:collection/:docId
Hosted-data list:              https://pitchrise.ludwitt.com/api/v1/data/:collection
Hosted-data quota usage:       https://pitchrise.ludwitt.com/api/v1/data/_meta/usage
```

All endpoints are CORS-enabled for browser callers. Server-to-server is preferred for any flow that touches your `client_secret`.

## Read these next

- **`oauth.md`** — full OAuth flow + PKCE + refresh
- **`credits.md`** — paid-credit pool, how 402 reads, how to gate UI
- **`data-api.md`** — hosted-storage CRUD shape, ETag concurrency, TTL, quotas
- **`security.md`** — what Ludwitt protects, what you must protect
- **`rate-limits.md`** — categories, headers, what 429 means
- **`errors.md`** — full error catalog
- **`openapi.yaml`** — machine-readable spec for all the above
- **`llms.txt`** — index of every doc, formatted for AI coding agents
