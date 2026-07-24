## Project 2 Submission

**Ember** — a multi-tenant cohort communications platform (*"where conversations turn into action"*), built Python-first with FastAPI + HTMX + PostgreSQL as a single service.

### Links
- Repository: https://github.com/jiaxinaspenlin-dotcom/Ember
- Deployment: https://ember-iia4.onrender.com

### Core Features
- **Cohorts (multi-tenant)** — separate workspaces, one identity across many, data isolated in SQL
- **Messaging** — channels, DMs, threads, reactions, mentions, notifications, near-real-time updates
- **Conversation → action** — Help Queue, Decision Log, and Tasks created from messages
- **Community** — online presence, kudos, daily check-ins, and a Cohort Campfire that grows with activity
- **Directory & search** — member profiles and full-text search
- **Auth & admin** — email/password + GitHub OAuth, per-cohort admin console

### Notes
Setup, architecture, and known limitations are in the repository README. 299 tests, `mypy --strict`, and `ruff` all green.
