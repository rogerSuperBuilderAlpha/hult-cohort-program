# Project 2 Submission — @joes9987

Summer Pilot 2026, Project 2 — **EudaChat** (internal communications platform).

## Production URL

https://comms-joes9987.vercel.app

Build repo: https://github.com/joes9987/comms-joes9987

## PM platform integration notes

- Shares the **same Supabase Auth project** as EudaPM (`https://pm-joes9987.vercel.app`, project `vidprovlxevofniwyhgs`)
- Staff / peers use the **same email** (and user UUID) across PM and chat — no separate identity system
- Profiles extended with `handle` (for `@mentions`) and `is_admin` (for `#announcements`)

## Architecture summary

- Next.js 16 App Router + Supabase Auth/Postgres/Realtime on Vercel
- Seeded public channels: `#general`, `#random`, `#help`; staff `#announcements`
- Channel create / rename / archive; 1:1 DMs; keyword search; in-app notifications (`chat_notifications`)
- Realtime via Supabase `postgres_changes` with ≤4s polling fallback
- Message history persisted in Postgres (no purge; ≥30 days)

## Agent usage

Cursor agents implemented schema/migration, auth shell, chat UI, Vercel deploy wiring, and this cohort submission. Human review for RLS, admin promotion, and smoke-test.

## Known limitations

- In-app notifications only (no email push)
- No threads / file attachments in MVP
- Forth PR contribution tracked separately: https://github.com/CodingWCal/forth/pull/32
