# Deploy Ludwitt/Hult API

## Docker (recommended)

```bash
cd execution/ludwitt-hult-api
docker compose up --build
curl http://localhost:4000/health
```

## Railway / Render / Fly

1. Connect repo subpath `execution/ludwitt-hult-api`
2. Set build: Dockerfile
3. Set port: `4000`
4. Env vars:
   - `ADMIN_KEY` — strong secret for snapshot export
   - `NODE_ENV=production`

## Vercel (not recommended)

Express long-running server — use container platform instead.

## Staging checklist (by Nov 1)

- [ ] HTTPS + custom domain `sandbox.api.ludwitt.hult`
- [ ] Production keys issued per student app (not shared demo keys)
- [ ] Roster blocklist loaded from cohort CSV
- [ ] Admin snapshot endpoint secured
- [ ] DEVELOPER.md published at docs URL

See [DEVELOPER.md](DEVELOPER.md) and [../../partnerships/ludwitt-hult-platform.md](../../partnerships/ludwitt-hult-platform.md).
