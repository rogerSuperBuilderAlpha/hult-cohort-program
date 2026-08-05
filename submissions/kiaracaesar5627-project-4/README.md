# Pattern Forge (Week 4 · Ludwitt learning)

Interview-prep learning app for coding patterns, registered on a Ludwitt/Hult-compatible
API hosted at the same origin (`/v1/*`).

## Topic

**Interview prep — coding patterns** (two pointers, sliding window, hash maps, BFS/DFS).

## Stack

- Next.js 15 App Router · TypeScript · Tailwind 4
- `jose` for HS256 launch JWTs
- Platform routes mirror `execution/ludwitt-hult-api` OpenAPI

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Smoke (dev server running):

```bash
npm run smoke
```

## Integration

1. `POST /v1/developer/apps` with `Authorization: Bearer prod_key_demo` → `app_id`, `api_key`, `jwt_secret`
2. `POST /v1/auth/launch-token` → open returned `launch_url`
3. `/launch?token=…` validates JWT, starts session cookie, records `lesson_started`
4. Lessons fire `lesson_started` / `quiz_submitted` / `lesson_completed`; heartbeat every 60s

Seeded app ID: `7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c`

## Deploy

```bash
npx vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin after the first deploy.
