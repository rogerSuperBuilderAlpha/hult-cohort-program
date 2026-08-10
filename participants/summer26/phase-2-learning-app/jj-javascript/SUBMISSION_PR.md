# [P2-L1] Submission — jj-javascript

Use this file as the PR body when opening the submission.

## Summary

**Git Arcade** — a gamified Git and terminal learning app with three timed, state-graded challenges. Integrated against a self-hosted Ludwitt/Hult reference API (HS256 launch tokens) with libSQL/Turso-backed event persistence.

## Ludwitt/Hult app ID

`eef082e6-ab33-48e0-aa12-44aa59571a5c`

Registered via self-hosted reference API at `https://ludwitt-api-dusky.vercel.app/v1/developer/apps` (not the ALC-gated hosted portal).

## Production listing URL

https://app-jj-javascript-git-arcade.vercel.app

## Integration evidence (sign-in or launch flow + events firing)

**Demo launch flow (2026-08-09, post-fix):**

```bash
# Visitor clicks Demo launch → POST /api/demo-launch returns 303 (not 307)
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  https://app-jj-javascript-git-arcade.vercel.app/api/demo-launch
# → 303

# Browser follows Location with GET → session cookie + /?launched=1
curl -s -c jar -b jar -X POST .../api/demo-launch -o /dev/null
curl -s -b jar "$(curl -s -D - -X POST .../api/demo-launch -o /dev/null | rg -i '^location:' | cut -d' ' -f2 | tr -d '\r')" -o /dev/null
curl -s -b jar https://app-jj-javascript-git-arcade.vercel.app/ | rg "First Commit|Signed in"
```

**Fail-closed:** invalid or missing tokens redirect to `/?error=…` with no session cookie.

**Events:** completing the First Commit challenge fires `quiz_submitted` and `lesson_completed`; platform returns `202 {"accepted":true,"counted":true}`.

**Metrics (libSQL-backed, survives redeploy when Turso env is configured):**

```json
GET /v1/apps/eef082e6-ab33-48e0-aa12-44aa59571a5c/metrics
{"unique_users":N,"qualified_users":M}
```

Run `cd app && npm run smoke-test` against production for a reproducible transcript.

## Agent usage

- **Research:** Mapped Ludwitt integration to cohort reference API; confirmed ALC gate bypass and that production listing URL means our deploy, not a Ludwitt directory.
- **Dev:** Built Git Arcade (Next.js + simulated shell engine with branches/checkout/restore), self-hosted API on Vercel with libSQL persistence, fixed demo-launch 303 redirect bug, added three challenges.
- **QA:** Production smoke: demo-launch 303 → GET launch → session cookie → challenge submit `counted:true`.

## Test plan

- [x] `GET /health` on Ludwitt API deployment
- [x] `POST /v1/developer/apps` returns `app_id` + `jwt_secret`
- [x] `POST /api/demo-launch` returns 303; GET `/launch` sets cookie + `/?launched=1`
- [x] Challenge submit → `lesson_completed` counted
- [x] `GET /v1/apps/{app_id}/metrics` → reproducible after libSQL/Turso configured
- [x] Production URL loads without auth wall (Vercel SSO set to preview-only)
- [x] Three challenges available at `/challenge/{id}`
