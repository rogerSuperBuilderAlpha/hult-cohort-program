# Deploying the reference API

Deploy this when you want a **long-lived instance** whose registrations survive. The default in-memory store means a process restart erases every app and event, so running it only on your laptop is how people lose their `app_id` mid-week.

## Docker

```bash
cd execution/ludwitt-hult-api
docker compose up --build
curl http://localhost:4000/health
```

## Railway / Render / Fly

1. Connect repo subpath `execution/ludwitt-hult-api`
2. Build: Dockerfile
3. Port: `4000`
4. Env: `ADMIN_KEY` (strong secret for snapshot export), `NODE_ENV=production`

Container platforms keep one process alive, which is what you want here.

## Vercel

Earlier notes said "not recommended" on the grounds that this is a long-running Express server. **In practice it works** — a Summer Pilot participant deployed it to Vercel in Week 4 and integrated against it for the week.

Understand the trade-off before you choose it: serverless instances are recycled, and because the store is in memory, **a recycle wipes your registrations**. That is survivable for a one-week pilot and fatal for anything longer. If you deploy to Vercel, re-check `GET /v1/apps/{app_id}/metrics` before you submit; an `invalid api key` response means the instance restarted and your registration is gone.

For anything beyond a week, put the store behind real persistence first.

## Hardening before this is more than a pilot

- [ ] Replace the in-memory store with a database — this is the root cause of most pain
- [ ] Per-student developer keys instead of the shared `sandbox_key_demo` / `prod_key_demo`
- [ ] Load the real roster into the blocklist in `src/store.js` (ships with placeholders)
- [ ] Authenticate `GET /v1/admin/cohorts/…/snapshots/…` — currently open
- [ ] HTTPS on a real domain you control (**not** `*.ludwitt.hult`, which does not exist)
- [ ] Publish [DEVELOPER.md](DEVELOPER.md) somewhere participants can reach without cloning the repo

See [README.md](README.md) for how this relates to the hosted platform at [ludwitt.com/developers](https://www.ludwitt.com/developers), and [../../partnerships/ludwitt-hult-platform.md](../../partnerships/ludwitt-hult-platform.md).
