# Project 1 Submission — @rogersuperbuilderalpha

Summer Pilot 2026, Project 1 — PM platform.

Production URL: https://hult-cohort-pm-project.vercel.app
Repo URL: https://github.com/godwinKamau/hult-cohort-PM-Project

Setup steps verified on fresh clone: From a clean clone, `cp .env.example .env.local` and fill in MongoDB Atlas (`MONGODB_URI`), Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`), and Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`); `GITHUB_WEBHOOK_SECRET` is optional (webhooks only). Then `npm install` and `npm run dev`, and open http://localhost:3000. Clerk must have Organizations enabled with GitHub as the sign-in provider and OAuth token retrieval turned on (repo-read scope) so GitHub activity can be attributed. Verified via the README's ≤5-minute smoke test: GitHub sign-in → create org → create project → `verify_repo()`/`link_repo()` → create/assign/drag tickets on the Kanban board → push to the linked branch and confirm the banner event + 👍 notification, ending with `/api/health` returning `{ ok: true }`.

Architecture summary: Next.js 16 (App Router) app on Vercel, backed by MongoDB Atlas via Mongoose as the source of truth, with Upstash Redis for ephemeral state (banner cache, reaction counts, presence, poll throttling). Auth and multi-tenancy run on Clerk Organizations with GitHub OAuth. Every data path is org-scoped: server actions and API route handlers call org-filtered repositories, and Clerk/GitHub webhooks (Svix + HMAC-verified) plus a tab-driven GitHub Events poller feed the live activity banner.

Motivation / engagement design notes: The platform is built to make progress visible and shipping feel rewarding. A Kanban board with `todo`/`in_progress`/`done` columns and drag-and-drop gives at-a-glance progress on every project, and project cards on the dashboard surface each project (and its linked repo) as a clear entry point. Clear next actions come from ticket assignment, filter-by-assignee, quick ticket creation, and deep-linkable side-peek ticket views (`?ticket=`) so people always know what to pick up next. Shipping signals are social: a live activity banner surfaces pushes and PRs on linked repos in near-real-time, teammates can 👍 those events (which sends the author an inbox notification), and an online-presence indicator shows who else in the org is active right now — turning individual commits into visible, celebrated cohort momentum.

Agent usage: The platform has no runtime AI; instead it was built agent-first. An `AGENTS.md` guide codifies the architecture rules (tenancy, repository layer, serialization, Redis conventions) so coding agents can extend the repo safely, and development/verification was done end-to-end with Claude driving the GitHub web UI and the cohort platform.

Known limitations: Realtime is polling-based (no WebSockets/SSE), so banner/presence/GitHub updates lag ~15–60s and GitHub polling needs an open tab plus a token with repo read access. Ticket position conflicts are last-write-wins, there are no email notifications or metrics dashboard, and features degrade gracefully when Redis is unavailable.
