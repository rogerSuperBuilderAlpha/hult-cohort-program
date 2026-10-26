# Security — what Ludwitt protects, what you must protect

When your app uses Ludwitt for OAuth, AI billing, or hosted storage, the
security model is **shared**. We list each property here so you know which
side of the line a given concern lands on.

## What Ludwitt enforces server-side

| Property | Mechanism |
|---|---|
| **Per-user isolation** of hosted storage | Bearer token resolves to one (appId, userId); all CRUD physically scoped to that user's subtree. App cannot specify a different userId. |
| **Per-app isolation** of hosted storage | Storage rooted at `leAppData/{appId}/...`; one app cannot read another's data even with the right user's token. |
| **Path injection prevention** | Strict `^[a-zA-Z0-9_-]{1,64}$` on collection + docId. No slashes, no dots, no Unicode. |
| **Field injection prevention** in `?where=` | Field name must match `^[a-zA-Z0-9_]{1,40}$` AND be in the collection's declared `indexedFields`. |
| **Prototype pollution prevention** | `__proto__`, `constructor`, `prototype` keys rejected. Underscore-prefixed keys (except `_ttl`) rejected. |
| **JSON depth-bomb prevention** | Document bodies rejected if nesting exceeds 32 levels. |
| **Per-doc + per-(app, user) quotas** | Atomic transactions reject writes that would exceed `maxDocBytes` (256 KB), `maxBytesPerUser` (10 MB), or `maxDocCountPerUser` (1000). |
| **Rate limiting** | Per-(app, user) limits: 300 reads/min, 60 writes/min, 60 lists/min. Exceeds → 429. |
| **Token revocation** | All access + refresh tokens revoked on user-revoke or app-disable; revocation row gates data routes even if a stale token slips through. |
| **PKCE** | S256 only; downgrade attempts rejected. |
| **Replay defense on auth codes** | Single-use; replay revokes the entire (user, app) token pair (RFC 6749 §4.1.2). |
| **Replay defense on refresh tokens** | Single-use; replay revokes the entire pair. |
| **Open-redirect defense** | `redirect_uri` must exactly match a value registered for your app; mismatches hard-fail (no redirect happens). |
| **Audit logging** | Every CRUD + every credit charge is logged with appId, userId, status, size. Engineers can read their own slice; users can read their own slice. |
| **Paid-credit-only spending** | Free / trial / promo credits are not spendable in third-party apps. Hard floor at 0 — your app cannot push a user negative. |
| **CORS** | All `/api/v1/*` and `/api/oauth/*` endpoints permit `*` origins; bearer-only auth means CSRF doesn't apply. |
| **Encryption at rest** | Firestore-managed (Google-managed keys). |
| **Encryption in transit** | TLS-only; the API rejects plain HTTP. |

## What you must protect

| Property | Why it's on you |
|---|---|
| `client_secret` | Anyone with this can impersonate your app and get tokens for anyone who authorizes. Server-side only, never in browser code, never in git, never in logs. |
| Access tokens | A leaked token gives the holder this user's data + credit-spend ability for up to 1 hour. Treat as session-grade secret. |
| Refresh tokens | A leaked refresh token can mint access tokens for 30 days. Single-use means a leak is detectable on next refresh. |
| `state` parameter on OAuth callbacks | Generate a random 32-byte value per authorize request; verify on callback. Without this, a CSRF attacker can pin a victim to the attacker's Ludwitt account. |
| PKCE `code_verifier` | Bind to the user's browser session. A leak undermines the PKCE protection. |
| Document body content | We don't inspect what you store. If you store credentials, secrets, or regulated data, you own the consequences. |
| Tenant assumptions in your own code | The bearer token is for ONE user. If you cache responses or build a backend, key everything by Ludwitt's `sub` (the user id from `/api/oauth/userinfo`). |

## What you may not store in hosted-data

Ludwitt's terms of service prohibit storing:
- HIPAA-protected health information (PHI) without a Business Associate Agreement
- COPPA-regulated children's data without parental consent verification
- Payment card data (PCI scope; use Stripe directly)
- Biometric identifiers
- Government-issued ID numbers

If your app needs any of these, talk to us first. We may be able to set up
a special-tier app, or you may need to fall back to BYOB and host the
sensitive bits yourself.

## Reporting a vulnerability

Found a hole in our auth, scope checks, or storage isolation? Email
`security@ludwitt.com`. We respond within 24 hours and ship fixes within 7
days for high/critical. We don't run a paid bounty yet but we credit
reporters publicly with permission.

## What we log on your app's behalf

Every API call writes a row to one of:
- `leAppDataAuditLog` — every `/api/v1/data/*` call (CRUD action, status, size)
- `appUsageEvents` — every `/api/v1/ai/messages` call (cost, tokens, transaction id)
- `credit_transactions` — every credit deduction (linked from above)

Engineers can query their own audit slice via the engineer dashboard.
Users can query their own slice across all apps via their account page.

There is no log of document **contents** — only that a write happened, the
size, and the doc id.
