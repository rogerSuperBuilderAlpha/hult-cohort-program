# AGENTS.md — Cohort Comms (Project 2)

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase Auth (email/password), Postgres, Row Level Security, Realtime on `messages`

## Fresh clone

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill Supabase + admin + Forth values
3. In Supabase SQL editor, run `supabase/schema.sql` (enable Realtime for `messages` if prompted)
4. `npm run dev` → http://localhost:3000
5. Sign up with the **same email/password** you use on [Forth PM](https://forth-bice.vercel.app/)

## Validation

```bash
npm test
npm run lint   # optional if eslint added
npm run build
```

## Architecture

- `app/actions.ts` — server actions (auth, messages, channels, DMs, search, notifications)
- `lib/supabase/` — browser, server (`@supabase/ssr`), middleware session refresh, service role for webhooks
- `lib/forth-links.js` — Forth deep links + unfurl parsing (also covered by `tests/forth-links.test.js`)
- `app/api/webhooks/forth/route.ts` — POST system messages to `#forth-updates` with `x-forth-webhook-secret`

## Realtime

- Client subscribes to `postgres_changes` on `messages` filtered by `channel_id`
- If Realtime fails, UI polls every **5 seconds** (documented fallback)

## Security

- Never commit `.env.local` or service role keys
- `#announcements` posting requires `profiles.role = 'admin'` (seed via `ADMIN_EMAILS` on sign-in/up)
- Webhook uses `FORTH_WEBHOOK_SECRET` header check; inserts use service role

## Design

Warm field-journal palette: ink `#1a2e1f`, paper `#f4efe6`, moss `#3d5a45`. Avoid generic purple SaaS UI.
