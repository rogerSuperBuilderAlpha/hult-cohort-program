# Relay — Internal communications (Project 2)

Focused cohort chat for the Hult Cohort Developer Program Summer Pilot 2026.
Replaces Discord with channels, DMs, staff announcements, search, and live updates.

**Author:** [@kiaracaesar5627](https://github.com/kiaracaesar5627)

## Production URL

_Pending first Vercel deploy — will be added here and on the submission PR._

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** on **Vercel**
- **Supabase** Postgres (service-role server access; `relay_*` tables)
- Email + password auth (bcrypt + signed HTTP-only JWT cookies via `jose`)
- Real-time MVP via **4s polling** (`GET /api/messages`)

## Baseline features

| Feature | Implementation |
|---------|----------------|
| Channels | ≥3 public channels (`#general`, `#reviews`, plus admin-created); create / rename / archive |
| Direct messages | 1:1 conversations between any two members |
| Persistence | Messages stored in Postgres; history window ≥ 30 days |
| Announcements | `#announcements` — only `ADMIN` can post |
| Search | Keyword search across message bodies |
| Real-time | Client poll every 4 seconds (≤ 5s requirement) |
| Notifications | In-app alerts for @mentions and DMs |
| PM integration | Sidebar deep link to FlexiFlow (`NEXT_PUBLIC_PM_URL`); same demo emails as Project 1 |

## Fresh-clone setup

```bash
cd submissions/kiaracaesar5627-project-2
cp .env.example .env
# Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET
# Optional: NEXT_PUBLIC_PM_URL=https://pilot-hult-pm.vercel.app
# Apply migration in Supabase SQL editor:
#   supabase/migrations/20260726_relay_init.sql
npm install
npm run db:seed
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

Emails match FlexiFlow Project 1 seed accounts for staff email matching.

## Architecture

```
Browser → Next.js (Vercel)
            ├─ Server Actions (auth, channels, messages, DMs)
            ├─ JWT session cookie (AUTH_SECRET)
            ├─ GET /api/messages (polling)
            └─ @supabase/supabase-js (service role) → relay_* tables
```

## Known limitations

- Polling (4s), not WebSockets / Supabase Realtime
- Auth is email/password only (no OAuth / shared SSO token with FlexiFlow yet)
- File attachments, reactions, threads are not in this MVP
- Message retention UI does not purge older than 30 days (queries filter by cutoff)

## License

MIT (inherits cohort program license context)
