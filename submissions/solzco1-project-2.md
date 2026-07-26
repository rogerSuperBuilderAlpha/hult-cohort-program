# Project 2 Submission — @solzco1

**Production URL:** _(set after Vercel deploy — Root Directory: `submissions/solzco1-project-2`)_

**Code:** `submissions/solzco1-project-2/`

## Summary

Cohort internal comms platform (channels, DMs, threads, search, notifications) on Next.js 14 + Supabase, integrated with winning PM platform **Forth** via deep links and webhook feed into `#forth-updates`.

## PM platform integration notes

- **Winning PM:** [Forth](https://forth-bice.vercel.app/)
- **Shared identity:** Sign up / log in with the **same email** you use on Forth (OAuth email on Forth must match comms account email).
- **Deep links (recommended):** `https://forth-bice.vercel.app/?taskId={taskId}` — paste in any channel; UI unfurls as an “Open in Forth” chip.
- **Webhooks:** `POST /api/webhooks/forth` with header `x-forth-webhook-secret` matching `FORTH_WEBHOOK_SECRET`; posts system lines to `#forth-updates`.
- **Header link:** `NEXT_PUBLIC_PM_PLATFORM_URL` opens Forth from the sidebar.

## Real-time vs async

- **Real-time:** Supabase Realtime `postgres_changes` on `messages`.
- **Async:** Persisted history, search, webhook-ingested Forth updates, in-app notification panel.

## Agent usage

- **Research:** Hult Project 2 requirements, Forth production URL, cohort submission layout under `submissions/{handle}-project-2/`.
- **Dev:** Cursor agent scaffolded channels/DMs/auth/schema/Forth webhook + unfurl; user steered product direction (“interesting platform”).
- **QA:** `npm test` (5/5), `npm run build` locally.
