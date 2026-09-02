# Ludwitt OAuth 2.0 + PKCE

Ludwitt implements OAuth 2.0 authorization code flow with optional PKCE. All
endpoints accept either `application/json` or `application/x-www-form-urlencoded`
bodies on POST.

## Endpoints

| Purpose | Method + URL |
|---|---|
| Browser redirect | `GET /oauth/authorize` |
| Consent decision (browser → backend) | `POST /api/oauth/authorize` |
| Token exchange (server-to-server) | `POST /api/oauth/token` |
| Userinfo | `GET /api/oauth/userinfo` |
| Revoke (RFC 7009) | `POST /api/oauth/revoke` |

## Scopes

| Scope | Grants |
|---|---|
| `profile` | sub, email, name, picture |
| `credits:read` | View user's spendable credit balance |
| `credits:spend` | Charge AI calls to the user's paid balance |
| `apps:read` | List other Ludwitt apps the user has connected |
| `data:read` | Read documents your app has stored on the user's behalf |
| `data:write` | Create / update / delete documents on the user's behalf |

Hosted-storage apps must request at least one of `data:read` or `data:write`.

## Step 1 — Browser redirect to `/oauth/authorize`

```
https://pitchrise.ludwitt.com/oauth/authorize
  ?client_id=<your client_id>
  &redirect_uri=<one of your registered redirect_uris, URL-encoded>
  &response_type=code
  &scope=<space-separated list, URL-encoded>
  &state=<random CSRF token you generated and stored>
  &code_challenge=<base64url(sha256(code_verifier))>      # if using PKCE
  &code_challenge_method=S256                              # if using PKCE
```

**State is required for CSRF protection.** Generate a random 32-byte value, store
it server-side or in a signed cookie keyed to the user's session, and verify on
callback. Never trust the value the browser sends back unverified.

**PKCE.** Recommended for native / single-page apps; required if you set
`pkceRequired: true` at registration. Generate a 43–128 character URL-safe
random `code_verifier`, then send `code_challenge = base64url(sha256(verifier))`
with `code_challenge_method=S256`.

## Step 2 — Callback handler

Ludwitt redirects the browser to your `redirect_uri` with `?code=<...>&state=<...>`.

1. Verify `state` matches what you stored.
2. POST to `/api/oauth/token` server-to-server (NOT from the browser):

```
POST https://pitchrise.ludwitt.com/api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=<the code from the redirect>
&redirect_uri=<the SAME redirect_uri you used in step 1>
&client_id=<your client_id>
&client_secret=<your client_secret>      # omit if PKCE-only public client
&code_verifier=<the verifier from step 1>  # required if PKCE
```

Successful response:

```json
{
  "access_token": "lt_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "lr_...",
  "scope": "profile credits:spend data:write"
}
```

Store both tokens keyed by your internal user id. The access token is a 1-hour
secret. The refresh token is good for 30 days.

## Step 3 — Read user identity

```
GET https://pitchrise.ludwitt.com/api/oauth/userinfo
Authorization: Bearer <access_token>
```

Returns:

```json
{ "sub": "<ludwitt user id>", "email": "...", "name": "...", "picture": "..." }
```

`sub` is the canonical Ludwitt user id — key your account record on it.

## Step 4 — Refresh tokens

Access tokens expire after 1 hour. Refresh before they do:

```
POST https://pitchrise.ludwitt.com/api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=<refresh>
&client_id=<your client_id>
&client_secret=<your client_secret>      # omit for PKCE-only public clients
```

The old refresh token is **single-use** — store the new one returned in the
response. Replaying a revoked refresh token will revoke ALL tokens for that
(user, app) pair (RFC 6749 §4.1.2 mitigation).

## Step 5 — Revoke (RFC 7009)

When a user logs out of your app or unlinks Ludwitt, revoke the token:

```
POST https://pitchrise.ludwitt.com/api/oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=<access or refresh token>
```

Always returns 200 on a syntactically valid request — the spec forbids leaking
whether the token was real.

## What happens when a user revokes your app from Ludwitt's UI

- All your access + refresh tokens for that user are revoked instantly.
- Your subsequent API calls return 401 with `error: "invalid_token"`.
- For hosted-data apps, the user's data enters a **30-day grace window**. If
  they re-authorize within 30 days, their data is preserved. After 30 days,
  the data is permanently deleted.

## Common errors

| HTTP | error code | Cause |
|---|---|---|
| 400 | `invalid_request` | missing or malformed parameter |
| 400 | `invalid_grant` | code expired, replayed, or redirect_uri mismatch |
| 400 | `invalid_scope` | requested a scope your app didn't register |
| 401 | `invalid_client` | client_secret wrong |
| 401 | `invalid_token` | access token expired, revoked, or wrong |
| 403 | `insufficient_scope` | endpoint needs a scope not on this token |

See `errors.md` for the full catalog.
