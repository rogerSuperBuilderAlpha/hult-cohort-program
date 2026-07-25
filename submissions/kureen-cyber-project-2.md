# Project 2 Submission — @kureen-cyber

**Banter** — production cohort communications for the Hult pilot: channels, DMs, threads, notifications, Banterlina research assistant, and dual Banter / Firebase (PM) auth linked by GitHub handle.

- Repo: https://github.com/kureen-cyber/Banter
- Production URL: https://banter-kureen-cyber.vercel.app
- Latest baseline on production: Banter `481241f` (Firestore preference + read cache when Firebase env is set; Gist auth/data reliability from `06d69e7`)

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind on Vercel. Local JSON file in dev; production Banter data in a **private GitHub Gist** (`BANTER_GIST_ID`, `BANTER_GIST_FILENAME`, `BANTER_GITHUB_TOKEN`), preferred over optional Vercel Blob; Firestore preference + read cache when `NEXT_PUBLIC_FIREBASE_*` is configured; Firebase Auth for shared PM identity; Banterlina via OpenAI-compatible API when keyed.

**Baseline:** seeded public channels (General, Announcements, Project 1, Backend Help, AI, Career, Random), 1:1 DMs with user search, message persistence + ~2.5s polling realtime, @mention / DM / thread notifications, Banter email-password auth plus PM Firebase email/GitHub sign-in, GitHub-handle linking and PM deep links / task webhook stub.

**Baseline completeness (Banter `f3151a5`):**
- **#announcements (admin-only post):** channel POST gated to owner|admin; non-admins get read-only UI; first cohort user becomes announcements owner so the channel stays usable.
- **Search:** `GET /api/search?q=` plus sidebar People / Messages tabs for keyword and message lookup.
- **@mentions:** exact/token match (name tokens, compact name, GitHub handle, email local)—no substring over-notify.
- **Channels:** create via sidebar +; rename and archive for channel admins; seeded `#general` and `#announcements` cannot be archived.

**Differentiators:** Banterlina AI assistant for quick research; dual auth with PM Firebase; sidebar GitHub link + Open PM tool deep link (`/u/{github}`); async threads; mobile shell.

**Agent usage**
- **Research:** Cursor Agent (Composer) — mapped Project 2 brief to Banter scope (channels/DMs/threads/notifications), dual Banter + PM Firebase auth, and Vercel deploy path.
- **Development:** Cursor Agent (Composer) with shell/deploy subagents — implemented Banter (Next.js), dual auth, Banterlina, themes, admin `#announcements`, message search, channel CRUD, and production auth/data reliability (session-reset Route Handler, JWT rehydrate, Vercel Blob → private GitHub Gist when Blob billing-blocked; Firestore preference + read cache when Firebase env is set).
- **QA:** Cursor Agent (Composer) + shell smoke subagents against https://banter-kureen-cyber.vercel.app — curl/API cookie-jar checks for signup/logout/signin, channel message persistence, DMs, @mention notifications (exact/token match), `GET /api/search`, and non-admin 403 on `#announcements`. Auth debugging verified: Server Component cookie mutation crash → session-reset; Blob 403 / non-JSON login errors → Gist store + hardened login client.
- **Human (kureen-cyber):** Reported live login failures, directed fixes/redeploys, and owns submission/merge.

**Production reliability:** Fixed post-sign-in crash (session cookies cleared in a Server Component → `/api/auth/session-reset` Route Handler + JWT rehydration across cold instances). Fixed logout → sign-in: ephemeral `/tmp` on Vercel, then Vercel Blob—when Blob was suspended (billing-blocked), login failed (including cryptic non-JSON client errors). Durable store moved to a **private GitHub Gist**; app prefers Gist over Blob; login client hardened for non-JSON error bodies (`06d69e7`). Banter `481241f` adds Firestore preference + read cache when Firebase env is set. Signup → logout → sign-in and broader production smoke verified on https://banter-kureen-cyber.vercel.app (2026-07-24).
