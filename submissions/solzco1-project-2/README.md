# Cohort Comms — Project 2

Internal communications platform for the Hult cohort: channels, DMs, @mentions, search, Forth PM integration, and Supabase-backed persistence.

## Features

- **Channels**: seeded `#general`, `#announcements`, `#reviews`, `#forth-updates`; create, rename (admin), archive (admin)
- **DMs**: 1:1 between cohort members via **Members & DMs**
- **Threads**: reply with `parent_id` on messages
- **Announcements**: admin-only posting (`ADMIN_EMAILS` → `profiles.role`)
- **Notifications**: in-app panel for @mentions and new DMs
- **Search**: keyword search via server action (`/search`)
- **Realtime**: Supabase Realtime on `messages`; **5s polling fallback** if the subscription fails
- **Forth**: unfurl `https://forth-bice.vercel.app/?taskId={id}` links; webhook posts to `#forth-updates`

## Auth (same as Forth PM)

Use the **same email and password** as your workspace on [Forth PM](https://forth-bice.vercel.app/). Comms uses a separate Supabase project but the curriculum expects matching credentials for demo flow.

## Fresh clone setup

```bash
cd solzco1-project-2
npm install
cp .env.example .env.local
```

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable **Realtime** for the `messages` table (Database → Replication) if the script does not attach it.
4. Set environment variables (see below).
5. `npm run dev`

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run dev`  | Local dev server     |
| `npm test`     | `node:test` helpers  |
| `npm run build`| Production build     |

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local (server only) | Forth webhook inserts |
| `NEXT_PUBLIC_PM_PLATFORM_URL` | Vercel + local | Forth base URL (default `https://forth-bice.vercel.app`) |
| `ADMIN_EMAILS` | Vercel + local | Comma-separated staff emails → admin role |
| `FORTH_WEBHOOK_SECRET` | Vercel + local | Header `x-forth-webhook-secret` for `POST /api/webhooks/forth` |

## Forth webhook

```http
POST /api/webhooks/forth
x-forth-webhook-secret: <FORTH_WEBHOOK_SECRET>
Content-Type: application/json

{
  "taskId": "abc-123",
  "title": "Ship comms MVP",
  "status": "landed",
  "message": "Optional custom line with link"
}
```

## Deploy (Vercel)

Import the repo, set all env vars above, deploy. Run `supabase/schema.sql` against production Supabase before first use.

## Tests

```bash
npm test
```

Covers Forth link parsing in `lib/forth-links.js`.
