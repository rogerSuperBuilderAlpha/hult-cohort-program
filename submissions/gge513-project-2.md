# Project 2 Submission — @gge513

Tavern, an internal communications platform built on one bet: a cohort of strangers doesn't need another place to move messages, it needs a place to build understanding. The app is a tavern; the AI is its bartender.

Repo: https://github.com/gge513/tavern
Production URL: https://tavern-cohort.vercel.app

Next.js 16 (App Router) + Auth.js v5 + Neon Postgres (Drizzle) + the Anthropic API, on Vercel. The baseline is all there: public channels with create/rename/archive, an admin-only announcements channel, DMs, @mention and DM notifications, keyword search, 2-second-polling realtime, and accounts keyed to the same email and GitHub identity as the PM platform. On top of it, the discovery spine: collaborator profiles generated from public GitHub work behind a hard approval gate, a game-built collaborator map, matching that explains itself (most alike + most complementary), bartender-led introductions that end with exactly one next step, project spaces with five structured conversation types and a cadence contract, and the snug, a private thinking room with a said/assuming/unknown ledger that seats two when a problem needs a second head. 27 cohort members are pre-reserved from this repo's PR history and claim their accounts on first GitHub sign-in. Full write-up in the PR description.
