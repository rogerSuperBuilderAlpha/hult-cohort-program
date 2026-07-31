# Hult Cohort 67 — Vibe Marketing Wall

A live cohort wall for Hult Cohort 67 (Summer Pilot 2026). Participants
submit their own profiles and projects, review each other's work
privately, and partners get a dedicated info page.

**Live site:** _add your deployed URL here once live_

## What this is

- A single-page site (`index.html`) — no build step, no framework
- Backed by [Supabase](https://supabase.com) (Postgres + auto-generated REST API)
- Deployable as-is to Vercel, Netlify, or any static host

## Features

- **Cohort wall** — searchable, filterable public directory of participants and their projects
- **Self-serve submission** — participants add their own profile, no admin needed
- **Multiple projects per profile** — each with an optional live URL, GitHub repo, and demo video link
- **Passcode-protected editing** — participants set a passcode when they submit, required to edit or delete later
- **Peer review** — private, attributed reviews visible only to the project owner and organizer
- **Moderation** — basic content filtering on submission, plus a community "report" button that auto-hides after 3 reports
- **Rate limiting** — basic per-browser submission throttling to deter spam
- **Organizer tools** — a password-gated tab for hiding/unhiding profiles and resetting a forgotten passcode

## Setup (to run your own copy)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in order — see [`MIGRATIONS.md`](./MIGRATIONS.md)
3. In Supabase, go to **Project Settings → API** and copy your **Project URL** and **anon/publishable key**
4. Open `index.html`, find the `SUPABASE_URL` and `SUPABASE_ANON_KEY` constants near the top of the `<script>` block, and paste in your own values
5. Deploy `index.html` to any static host (Vercel, Netlify, GitHub Pages, etc.) — no build command needed

## A note on the exposed Supabase key

This repo (and the deployed site) contains a Supabase **anon/publishable key** in plain text.
That's expected and safe by Supabase's design — this key is meant to be public-facing,
the same way it's visible to anyone who opens their browser's dev tools on the live site.

The actual security lives in the database, not in hiding this key:

- All writes to sensitive fields (passcodes, deletes, hides) go through
  Postgres functions (`security definer`) that verify a passcode hash
  server-side before making any change
- Row Level Security (RLS) is enabled on every table
- Direct table updates/deletes are blocked at the database level — only
  the passcode-checked functions can modify protected data

If you fork this project, do **not** put a Supabase `service_role` key
anywhere in this file or repo — that key bypasses all of the above and
must never be exposed client-side.

## Organizer access

The "Organizer" tab is gated by a simple password checked in the browser
— this is a light deterrent for casual visitors, not real access control.
See the note inside that tab in the app itself for details.

## License

MIT — see `LICENSE`. Free to fork, adapt, and reuse.
