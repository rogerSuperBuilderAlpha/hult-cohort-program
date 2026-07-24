# Project 2 Submission — @kureen-cyber

**Banter** — production cohort communications for the Hult pilot: channels, DMs, threads, notifications, Banterlina research assistant, and dual Banter / Firebase (PM) auth linked by GitHub handle.

- Repo: https://github.com/kureen-cyber/Banter
- Production URL: https://banter-kureen-cyber.vercel.app
- Baseline fixes shipped: Banter `f3151a5` (production)

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind on Vercel. Local JSON file in dev; production Banter data in private Vercel Blob (`BLOB_READ_WRITE_TOKEN`); Firebase Auth for shared PM identity; Banterlina via OpenAI-compatible API when keyed.

**Baseline:** seeded public channels (General, Announcements, Project 1, Backend Help, AI, Career, Random), 1:1 DMs with user search, message persistence + ~2.5s polling realtime, @mention / DM / thread notifications, Banter email-password auth plus PM Firebase email/GitHub sign-in, GitHub-handle linking and PM deep links / task webhook stub.

**Baseline completeness (Banter `f3151a5`):**
- **#announcements (admin-only post):** channel POST gated to owner|admin; non-admins get read-only UI; first cohort user becomes announcements owner so the channel stays usable.
- **Search:** `GET /api/search?q=` plus sidebar People / Messages tabs for keyword and message lookup.
- **@mentions:** exact/token match (name tokens, compact name, GitHub handle, email local)—no substring over-notify.
- **Channels:** create via sidebar +; rename and archive for channel admins; seeded `#general` and `#announcements` cannot be archived.

**Differentiators:** Banterlina AI assistant for quick research; dual auth with PM Firebase; sidebar GitHub link + Open PM tool deep link (`/u/{github}`); async threads; mobile shell.

**Production reliability:** Fixed post-sign-in crash (session cookies cleared in a Server Component → `/api/auth/session-reset` Route Handler + JWT rehydration across cold instances). Fixed "Invalid email or password" after logout (ephemeral `/tmp` on Vercel → Blob-backed persistence). Signup → logout → sign-in verified on production.