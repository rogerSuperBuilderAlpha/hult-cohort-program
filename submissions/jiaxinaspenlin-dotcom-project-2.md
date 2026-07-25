## Summary

**Ember** — a multi-tenant cohort communications platform (*“where conversations turn into action”*), built Python-first with FastAPI, HTMX, and PostgreSQL as a single service.

- Repository: https://github.com/jiaxinaspenlin-dotcom/Ember

## Production URL

https://ember-iia4.onrender.com

## PM platform integration notes

Ember provides a lightweight, link-level integration with Forth, the cohort’s selected project-management platform.

Cohort administrators can associate an Ember cohort with its related Forth workspace URL. Once configured, members can open Forth directly from the Ember sidebar. Ember tasks, Decision Log entries, and Help Queue items can also reference a validated Forth URL, and valid Forth links included in messages render as labeled preview cards.

The integration is intentionally limited to navigation and contextual linking. Ember and Forth retain separate accounts, databases, and authorization systems. Ember does not read, create, modify, or synchronize Forth task data because Forth does not currently expose a confirmed external task API, third-party authorization flow, or webhook system.

A deeper integration would require authenticated Forth workspace and task endpoints, stable resource identifiers, permission checks, integration credentials, and signed webhooks.

## Core features

- **Cohorts (multi-tenant)** — separate workspaces, one identity across multiple cohorts, with cohort data isolated in PostgreSQL
- **Messaging** — public channels, direct messages, threads, reactions, mentions, notifications, and near-real-time updates
- **Channel management** — authorized users can create, rename, and archive channels
- **Announcements** — staff-controlled announcement publishing
- **Conversation → action** — Help Queue, Decision Log, and Tasks created from messages
- **Community** — online presence, kudos, daily check-ins, and a Cohort Campfire that grows with activity
- **Directory and search** — member profiles and full-text message search
- **Authentication and administration** — email/password authentication, GitHub OAuth, and a per-cohort admin console
- **Forth integration** — cohort workspace linking, validated Forth references on action items, and safe Forth message-preview cards

## Architecture summary

Ember uses FastAPI for routing, authentication, business logic, authorization, and database operations, while HTMX provides interactive updates without requiring a separate JavaScript frontend application. Keeping the product as a single Python service reduced deployment complexity and kept server-rendered views, API behavior, and permission rules closely aligned.

PostgreSQL stores users, cohorts, memberships, channels, messages, direct conversations, reactions, notifications, tasks, decisions, Help Queue items, and community activity. Near-real-time messaging is handled through recurring HTMX requests, allowing new content to appear without a manual refresh while keeping the architecture simpler than a WebSocket-based implementation.

The Forth integration remains link-only by design. Ember validates and stores Forth URLs but does not access Forth data, credentials, or authentication systems.

## Agent usage

- **Research:** AI-assisted research was used to inspect Forth’s architecture and authentication model. The review confirmed that Forth uses Firebase Authentication with Google and GitHub sign-in for its own users, but does not currently expose a confirmed third-party task API or webhook system.
- **Development:** AI-assisted development supported architecture planning, database modeling, FastAPI routes, HTMX templates, authentication, messaging workflows, Forth URL validation, database migrations, authorization checks, tests, and documentation. I reviewed and directed the implementation and made the final product and architecture decisions.
- **QA:** I ran the full test suite with 329 passing tests, including 29 new Forth-integration tests. I also ran `ruff`, `mypy --strict`, and `alembic check`; all passed, with no migration drift. I additionally verified the core messaging, permission, persistence, search, announcement, and Forth-link workflows.

## Known limitations

- The Forth integration is link-only. Ember does not synchronize Forth accounts, projects, task status, assignments, or deadlines.
- Ember and Forth maintain separate accounts, databases, and authorization systems.
- Near-real-time updates use polling rather than persistent WebSocket connections, so updates are not instantaneous.
- The Render deployment may experience a cold-start delay after a period of inactivity.
- GitHub OAuth depends on the production callback URL and environment variables being configured correctly in GitHub and Render.

## Test plan

- [x] Build repository is public at `jiaxinaspenlin-dotcom/Ember`
- [x] Production URL returns successfully
- [x] At least three public channels are supported
- [x] Channels can be created, renamed, and archived
- [x] Direct messages are supported between cohort members
- [x] Messages persist after refresh
- [x] Staff announcements are permission-controlled
- [x] Messages can be searched by keyword
- [x] New messages appear without a manual refresh
- [x] Cohort admins can configure, update, and remove a validated Forth workspace URL
- [x] Non-admin and cross-cohort Forth-link changes are rejected
- [x] Tasks, decisions, and Help Queue items can reference Forth links
- [x] Valid Forth links in messages render as safe preview cards
- [x] Lookalike domains, unsafe schemes, malformed URLs, and embedded credentials are rejected
- [x] 329 tests pass
- [x] `mypy --strict` passes
- [x] `ruff` passes
- [x] `alembic check` reports no migration drift