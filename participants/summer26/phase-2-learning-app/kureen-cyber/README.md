# InterviewForge

Interview prep app on the **Ludwitt Learning Engineer** platform (Hosted-storage tier, 35% engineer share).

## Ludwitt docs (offline)

Developer docs live in [`.ludwitt/`](./.ludwitt/). Start with [`.ludwitt/llms.txt`](./.ludwitt/llms.txt).

Re-fetch:

```bash
# PowerShell
New-Item -ItemType Directory -Force -Path .ludwitt | Out-Null
@(
  'llms.txt','quickstart.md','oauth.md','credits.md','security.md',
  'rate-limits.md','errors.md','openapi.yaml','data-api.md'
) | ForEach-Object {
  Invoke-WebRequest "https://pitchrise.ludwitt.com/docs/le/$_" -OutFile ".ludwitt/$_"
}
```

## Integration checklist

| Step | Status |
| --- | --- |
| OAuth authorize + PKCE S256 | ✅ `/api/auth/login` |
| Callback token exchange | ✅ `/api/auth/callback` |
| Userinfo → session by `sub` | ✅ iron-session cookie |
| Hosted-data `Events` + `sessions` | ✅ practice + launch events |
| AI via credits proxy | ✅ `/api/practice/feedback` |
| Refresh before expiry | ✅ `requireSession` |

## Credentials

Set in Vercel / `.env.local` (never commit secrets):

- `LUDWITT_CLIENT_ID=le_42901d22b6f990da1324b3`
- `LUDWITT_CLIENT_SECRET=...`
- Redirect URIs registered on Ludwitt:
  - `https://interview-forge-rosy.vercel.app/api/auth/callback`
  - `http://localhost:3000/api/auth/callback`

Collections:

- `Events` — `eventType`, `createdAt`, `sessionId`
- `sessions` — `status`, `createdAt`, `track`

## Run locally

```bash
cp .env.example .env.local
# fill LUDWITT_CLIENT_SECRET + SESSION_SECRET
npm install
npm run dev
```

Production: https://interview-forge-rosy.vercel.app → **Sign in with Ludwitt**
