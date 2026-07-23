# Project 2 Submission — @kureen-cyber

**Banter** — production cohort communications for the Hult pilot: channels, DMs, threads, notifications, Banterlina research assistant, and dual Banter / Firebase (PM) auth linked by GitHub handle.

- Repo: https://github.com/kureen-cyber/Banter
- Production URL: https://banter-kureen-cyber.vercel.app

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind on Vercel. Local JSON store for MVP persistence (Vercel `/tmp` + warm-instance cache); Firebase Auth for shared PM identity; Banterlina via OpenAI-compatible API when keyed.

**Baseline:** seeded public channels (General, Announcements, Project 1, Backend Help, AI, Career, Random), 1:1 DMs with user search, message persistence + ~2.5s polling realtime, @mention / DM / thread notifications, Banter email-password auth plus PM Firebase email/GitHub sign-in, GitHub-handle linking and PM deep links / task webhook stub.

**Differentiators:** Banterlina AI assistant for quick research; dual auth with PM Firebase; sidebar GitHub link + Open PM tool deep link (`/u/{github}`); async threads; mobile shell.
