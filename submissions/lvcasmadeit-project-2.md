# Project 2 Submission — @lvcasmadeit

Summer Pilot 2026, Project 2 — **teamwrk** (internal communications for the cohort).

**Production URL:** https://teamwrk-gamma.vercel.app  
**Repo:** https://github.com/lvcasmadeit/teamwrk  
**Mode:** Real-time (Supabase Realtime `postgres_changes` on messages + notifications)

## Architecture summary

teamwrk is a Next.js 16 (App Router) + React 19 + TypeScript app on Vercel. Supabase provides GitHub OAuth, Postgres, Row Level Security, and Realtime. The dual-sidebar shell covers public channels, admin-only `#announcements`, 1:1 DMs, in-app DM notifications, and keyword search (`search_messages` RPC, 30-day window). Cohort access is gated by `cohort_allowlist` + `is_cohort_member()` in proxy and RLS. A Vercel cron calls `purge_old_messages` for 30-day retention.

## PM platform integration notes

None / N/A for this submission — no APIs, deep links, or shared data paths with the winning PM platform yet. Auth is GitHub OAuth (shared identity surface via GitHub username); PM email match / deep-link unfurling is deferred.

## Known limitations

- Sign-in is GitHub OAuth only (no email/password). Cohort members must be on `cohort_allowlist`.
- No PM-platform deep links, task unfurls, or shared user-table sync yet.
- Profile editing is a stub; no file attachments, reactions, or presence indicators.
- Capacity is RLS + allowlist oriented for cohort scale; mass concurrent signup has not been load-tested end-to-end.

## Setup steps verified on fresh clone

1. `git clone https://github.com/lvcasmadeit/teamwrk.git && cd teamwrk`
2. `npm install`
3. Copy `.env.example` → `.env.local` and set Supabase URL, anon key, service role key, and `CRON_SECRET`
4. Configure GitHub OAuth in Supabase; add app `/auth/callback` redirect URLs
5. `npx supabase db push` (or run the init migration in the SQL editor); seed `cohort_allowlist`
6. `npm run dev` / `npm run build` — production deployed on Vercel with the same env vars

## Agent usage summary

Built and deployed with **Cursor Agent** (Composer):

- **Research:** Cohort Project 2 requirements, submission PR format from prior Project 1, Next.js 16 / Supabase Auth + Realtime patterns
- **Dev:** Channels, DMs, announcements, search, Realtime hooks, dual-sidebar shell, RLS/cohort gating, Vercel cron retention
- **QA / deploy:** Linked Vercel project, pushed env vars, production deploy to `teamwrk-gamma.vercel.app`, smoke-checked HTTPS 200 on `/` and `/login`
