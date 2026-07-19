# Project 1 Submission — @rogersuperbuilderalpha

Summer Pilot 2026, Project 1 — PM platform.

Production URL: https://hult-cohort-pm-project.vercel.app

Architecture summary: Next.js 16 (App Router) app on Vercel, backed by MongoDB Atlas via Mongoose as the source of truth, with Upstash Redis for ephemeral state (banner cache, reaction counts, presence, poll throttling). Auth and multi-tenancy run on Clerk Organizations with GitHub OAuth. Every data path is org-scoped: server actions and API route handlers call org-filtered repositories, and Clerk/GitHub webhooks (Svix + HMAC-verified) plus a tab-driven GitHub Events poller feed the live activity banner.

Agent usage: The platform has no runtime AI; instead it was built agent-first. An `AGENTS.md` guide codifies the architecture rules (tenancy, repository layer, serialization, Redis conventions) so coding agents can extend the repo safely, and development/verification was done end-to-end with Claude driving the GitHub web UI and the cohort platform.

Known limitations: Realtime is polling-based (no WebSockets/SSE), so banner/presence/GitHub updates lag ~15–60s and GitHub polling needs an open tab plus a token with repo read access. Ticket position conflicts are last-write-wins, there are no email notifications or metrics dashboard, and features degrade gracefully when Redis is unavailable.
