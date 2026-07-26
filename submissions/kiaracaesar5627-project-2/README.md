# Huddle — Internal communications (Project 2)

Focused cohort chat for the Hult Cohort Developer Program Summer Pilot 2026.
Channels, DMs, staff announcements, search, and live updates — no Discord required.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

https://pilot-hult-comms.vercel.app

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** on **Vercel**
- **In-memory store** (auto-seeded on cold start; Vercel-safe, no native SQLite)
- Email + password auth (bcrypt + signed HTTP-only JWT cookies via `jose`)
- Optional **Login with GitHub** (OAuth Authorization Code; same JWT session cookie)
- Real-time MVP via **4s polling** (`GET /api/messages`)

## Baseline features

| Feature | Implementation |
|---------|----------------|
| Channels | General, Reviews, Setup (+ Announcements); admin create / rename / archive |
| Direct messages | 1:1 conversations between any two members |
| Persistence | SQLite messages; history window â‰¥ 30 days |
| Announcements | Announcements — only `ADMIN` can post |
| Search | Keyword search across message bodies |
| Real-time | Client poll every 4 seconds |
| Notifications | In-app alerts for @mentions and DMs |
| PM integration | Sidebar deep link to FlexiFlow; same demo emails as Project 1 |

## Fresh-clone setup

```bash
cd submissions/kiaracaesar5627-project-2
cp .env.example .env
# Set AUTH_SECRET (any long random string)
# Optional: set GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET for Login with GitHub
npm install
npm run db:seed   # optional — app also auto-seeds on first request
npm run build
npm run dev
```

Open http://localhost:3000

### Login with GitHub (optional)

1. Create a GitHub OAuth App under **Settings → Developer settings → OAuth Apps**.
2. Set **Authorization callback URL**:
   - Production: `https://pilot-hult-comms.vercel.app/api/auth/github/callback`
   - Local: `http://localhost:3000/api/auth/github/callback`
3. Copy the Client ID and Client Secret into `.env` / Vercel env:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - Optional: `GITHUB_CALLBACK_URL` or `NEXT_PUBLIC_APP_URL` if the callback must not be derived from the request origin
4. Restart the app. Login and register show **Continue with GitHub** when both vars are set; otherwise the button is omitted with a short note (email/password still works).

Routes: `GET /api/auth/github` (start) → GitHub → `GET /api/auth/github/callback` (session cookie → `/app`).

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
            ├─ GET /api/auth/github (+ /callback) → JWT session cookie
            ├─ JWT session cookie (AUTH_SECRET)
            ├─ GET /api/messages (polling ≤ 4s)
            └─ In-memory store (auto-seeded per cold start)
```

## Known limitations

- Persistence is process-local: data resets on Vercel cold starts (demo accounts re-seed automatically)
- GitHub OAuth is optional and gated on env vars; no shared SSO with FlexiFlow yet
- File attachments, reactions, and threads are out of MVP scope

## License

MIT (inherits cohort program license context)
