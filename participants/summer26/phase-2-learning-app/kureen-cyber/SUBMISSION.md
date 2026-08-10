# [P2-L1] Submission — kureen-cyber

**InterviewForge** — interview prep learning app integrated with Ludwitt (OAuth PKCE, hosted-storage events, credit-spend AI coach).

## Ludwitt/Hult app ID

`le_42901d22b6f990da1324b3`

## Production listing URL

https://interview-forge-rosy.vercel.app

## Integration evidence (launch flow + events firing)

App registered and **approved** on Ludwitt. Production login builds the authorize URL with the registered client ID; Test Mode sandbox token verifies userinfo + a non-heartbeat `Events` write.

**Authorize URL from production login** (`GET /api/auth/login` → 307):

```
Location: https://pitchrise.ludwitt.com/oauth/authorize?client_id=le_42901d22b6f990da1324b3&redirect_uri=https%3A%2F%2Finterview-forge-rosy.vercel.app%2Fapi%2Fauth%2Fcallback&response_type=code&scope=profile+credits%3Aread+credits%3Aspend+data%3Aread+data%3Awrite&state=…&code_challenge=…&code_challenge_method=S256
```

**Userinfo (Test Mode sandbox token):**

```
curl -H "Authorization: Bearer <test_token>" https://pitchrise.ludwitt.com/api/oauth/userinfo
→ HTTP 200
{"sub":"YJF2ARCrZYeG8RBmtFYk0fmuSzG2","email":"billouinkureen@gmail.com","name":"Kureen Billouin","picture":"https://lh3.googleusercontent.com/a/ACg8ocL1_X7lT_-BTqWBn8LX8w2J9D5peQeQ_Dwi_EWsVfvvh01S-Q=s96-c"}
```

**Non-heartbeat event write (`Events` collection):**

```
curl -X PUT -H "Authorization: Bearer <test_token>" -H "Content-Type: application/json" \
  -d '{"data":{"eventType":"session_start","createdAt":"2026-08-09T18:28:28Z","sessionId":"pr-evidence-session","source":"cohort_pr_evidence"}}' \
  https://pitchrise.ludwitt.com/api/v1/data/Events/evt-pr-evidence-20260809142828
→ HTTP 200
{"etag":"e21566c702b0400a9b1f65e1e712070c","sizeBytes":136,"quota":{"docCount":3,"totalBytes":500,"quota":{"maxDocCountPerUser":1000,"maxBytesPerUser":10485760,"maxDocBytes":262144}}}
```

## Canonical build repo

https://github.com/kureen-cyber/Educational-Learning-App

## Fresh clone setup

```bash
cp .env.example .env.local
# fill LUDWITT_CLIENT_SECRET + SESSION_SECRET
npm install
npm run dev
```
