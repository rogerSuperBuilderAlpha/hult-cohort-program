# Comms — Internal communications (Project 2)

Focused cohort chat for the Hult Cohort Developer Program Summer Pilot 2026.
Channels, DMs, staff announcements, search, and live updates — no Discord required.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://pilot-hult-comms.vercel.app

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** on **Vercel**
- **SQLite** via `@libsql/client` (local `data/comms.db`; optional Turso for durable prod)
- Email + password auth (bcrypt + signed HTTP-only JWT cookies via `jose`)
- Real-time MVP via **4s polling** (`GET /api/messages`)

## Baseline features

| Feature | Implementation |
|---------|----------------|
| Channels | `#general`, `#reviews`, `#setup` (+ `#announcements`); admin create / rename / archive |
| Direct messages | 1:1 conversations between any two members |
| Persistence | SQLite messages; history window ≥ 30 days |
| Announcements | `#announcements` — only `ADMIN` can post |
| Search | Keyword search across message bodies |
| Real-time | Client poll every 4 seconds |
| Notifications | In-app alerts for @mentions and DMs |
| PM integration | Sidebar deep link to FlexiFlow; same demo emails as Project 1 |

## Fresh-clone setup

```bash
cd submissions/kiaracaesar5627-project-2
cp .env.example .env
# Set AUTH_SECRET (any long random string)
npm install
npm run db:seed   # optional — app also auto-seeds on first request
npm run build
npm run dev
```

Open http://localhost:3000

### Seed accounts

| Role  | Email                  | Password     |
|-------|------------------------|--------------|
| Admin | `demo@flexiflow.test`  | `DemoPass1!` |
| Member| `sam@flexiflow.test`   | `SamPass1!`  |
| Member| `guest@flexiflow.test` | `GuestPass1!`|

## Architecture

```
Browser → Next.js (Vercel)
            ├─ Server Actions (auth, channels, messages, DMs)
            ├─ JWT session cookie (AUTH_SECRET)
            ├─ GET /api/messages (polling ≤ 4s)
            └─ @libsql/client → SQLite (local file or Turso)
```

## Known limitations

- On Vercel without Turso, the SQLite file lives under `/tmp` and can reset on cold starts — set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` for durable production storage
- Auth is email/password only (no OAuth / shared SSO with FlexiFlow yet)
- File attachments, reactions, and threads are out of MVP scope

## License

MIT (inherits cohort program license context)
