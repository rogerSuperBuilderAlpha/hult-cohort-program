# Project 2 Submission — @joes9987

Summer Pilot 2026, Project 2 — **EudaChat** (internal communications platform).

## Production URL

https://comms-joes9987.vercel.app

Build repo (public): https://github.com/joes9987/comms-joes9987

## PM platform integration notes

- Shares the **same Supabase Auth project** as EudaPM (`https://pm-joes9987.vercel.app`, project `vidprovlxevofniwyhgs`)
- Staff / peers use the **same email** (and user UUID) across PM and chat — no separate identity system
- Profiles extended with `handle` (for `@mentions`) and `is_admin` (for `#announcements`)
- Chat alerts use **`chat_notifications`** — does not touch EudaPM’s `notifications` table

## Architecture summary

- Next.js 16 App Router + Supabase Auth/Postgres/Realtime on Vercel
- Seeded public channels: `#general`, `#random`, `#help`; staff `#announcements`
- Channel create / rename / archive; 1:1 DMs; keyword search; in-app notifications (`chat_notifications`)
- Realtime via Supabase `postgres_changes` with ≤4s polling fallback
- Message history persisted in Postgres (no purge; ≥30 days)
- Profile customization: avatar, banner, bio, private DOB; Discord-style profile popover in chat

## RLS review (shared production Supabase with EudaPM)

Completed 2026-07-24 against `supabase/migrations/001_init.sql`–`005_*.sql` and live `pg_policies`:

| Concern | Finding |
|---------|---------|
| Table isolation | Chat adds `channels`, `dm_threads`, `messages`, `chat_notifications`, `profile_private`. Does **not** alter PM `projects` / `tasks` / `boards` / `notifications` policies. |
| Notification collision | Chat uses `chat_notifications` only (PM already owns `notifications`). |
| Channel / message read | Authenticated users can read public channel messages; announcements readable by all, **insert** restricted to `is_admin` (or channel creator rules for management). |
| DM isolation | `dm_threads` select/insert and DM `messages` select/insert require `auth.uid()` ∈ `{user_a, user_b}`. |
| Notifications | `chat_notifications` select/update only for `user_id = auth.uid()`; inserts for peer alerts via **security definer** triggers, not client writes. |
| Staff escalation | `guard_profile_is_admin_change` trigger blocks non-admins from flipping `is_admin`; cannot remove last staff. |
| Private DOB | `profile_private` RLS: owner-only all commands. |
| Storage | `avatars` bucket: public read; write/update/delete limited to `{auth.uid()}/…` folder. |
| Shared `profiles` | Intentional cohort-wide read for mentions/roster; own-row update from PM policy; staff grant via admin policy + trigger. |

**Residual shared-DB risk (accepted for cohort):** anyone authenticated on this Supabase project can read all `profiles` (email, display name, handle) — same as EudaPM’s open cohort model. Private DOB and DMs remain owner/participant scoped.

## Smoke test (2026-07-24)

- [x] Repo public: `https://github.com/joes9987/comms-joes9987` → HTTP 200; `AGENTS.md` present
- [x] Deploy: `https://comms-joes9987.vercel.app` → `/` and `/login` 200
- [x] `npm run build` succeeds in product repo
- [x] Shared identity: same Supabase project URL as EudaPM (`vidprovlxevofniwyhgs`) — confirmed by staff review + env
- [x] Channels: seeded `#general` / `#random` / `#help` / `#announcements` present after migrations
- [x] DMs: 1:1 thread create via ordered pair + RLS participant check (code + prior live use)
- [x] Persistence: messages in Postgres; refresh retains history
- [x] Announcements: non-admin post blocked by `messages_insert` + UI gate
- [x] Search: `/app/search` keyword `ilike` across channels + own DMs
- [x] Notifications: DM / `@mention` rows written by triggers into `chat_notifications`
- [x] Realtime: `postgres_changes` on `messages` + `chat_notifications` (polling fallback in UI)
- [x] No secrets in git: only `.env.example` committed; `.env.local` gitignored

## Agent usage

Cursor agents implemented schema/migration, auth shell, chat UI, profile features, Vercel deploy, and this cohort submission. Human completed RLS review + smoke-test checklist above.

## Known limitations

- In-app notifications only (no email push)
- No threads / file attachments in MVP
- Personal app wallpaper is device-local (localStorage), not synced across browsers
- Forth PR contribution tracked separately: https://github.com/CodingWCal/forth/pull/32
