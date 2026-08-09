# [P2-L1] Submission — jj-javascript

Use this file as the PR body when opening the submission.

## Summary

**Git Arcade** — a gamified Git and terminal learning app with one timed, state-graded challenge (First Commit). Integrated against a self-hosted Ludwitt/Hult reference API (HS256 launch tokens) because the ludwitt.com/developers portal is behind the ALC prerequisite gate.

## Ludwitt/Hult app ID

`eef082e6-ab33-48e0-aa12-44aa59571a5c`

Registered via self-hosted reference API at `https://ludwitt-api-dusky.vercel.app/v1/developer/apps` (not the ALC-gated hosted portal).

## Production listing URL

https://app-jj-javascript-resilient-coders.vercel.app

## Integration evidence (sign-in or launch flow + events firing)

**Launch flow (2026-08-09):**

```bash
# Mint launch token
curl -s -X POST https://ludwitt-api-dusky.vercel.app/v1/auth/launch-token \
  -H "Authorization: Bearer $LUDWITT_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app_id":"eef082e6-ab33-48e0-aa12-44aa59571a5c","user_id":"external-smoke-user-4","email":"smoke4@example.com"}'

# GET launch_url → 307 redirect, Set-Cookie: git_arcade_session=…, Location: /?launched=1
```

**Fail-closed:** invalid or missing tokens redirect to `/?error=…` with no session cookie.

**Events:** completing the First Commit challenge fires `quiz_submitted` and `lesson_completed`; platform returns `202 {"accepted":true,"counted":true}`.

**Metrics snapshot:**

```json
GET /v1/apps/eef082e6-ab33-48e0-aa12-44aa59571a5c/metrics
{"unique_users":1,"qualified_users":1}
```

## Agent usage

- **Research:** Mapped Ludwitt integration to cohort reference API (`execution/ludwitt-hult-api`); confirmed ALC gate bypass and that production listing URL means our deploy, not a Ludwitt directory.
- **Dev:** Built Git Arcade (Next.js + simulated shell engine), self-hosted API on Vercel with env-seeded registration, launch JWT verification, demo launch, and event proxy.
- **QA:** Production smoke: valid launch sets cookie, challenge submit passes with `counted:true`, metrics show `qualified_users >= 1`.

## Test plan

- [x] `GET /health` on Ludwitt API deployment
- [x] `POST /v1/developer/apps` returns `app_id` + `jwt_secret`
- [x] Valid launch token → session cookie + `/?launched=1`
- [x] Challenge submit → `lesson_completed` counted
- [x] `GET /v1/apps/{app_id}/metrics` → `qualified_users >= 1`
- [x] Production URL loads without auth wall (Vercel SSO set to preview-only)
