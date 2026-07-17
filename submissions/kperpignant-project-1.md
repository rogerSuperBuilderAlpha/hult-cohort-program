# Project 1 Submission — @kperpignant

Summer Pilot 2026, Project 1 — PM platform with agentic bug triage.

## Production URL

https://nidora-one.vercel.app

Build repo: https://github.com/kperpignant/NIDORA

## Setup steps verified on fresh clone

1. `git clone https://github.com/kperpignant/NIDORA.git && cd NIDORA`
2. `npm install`
3. Copy `.env.local.example` → `.env.local` and set:
   - `VITE_CONVEX_URL` (from `npx convex dev`)
   - `VITE_CLERK_PUBLISHABLE_KEY` (Clerk dashboard)
4. On Convex deployment: `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev`
5. In Clerk: enable the **Convex** JWT template and include GitHub username (e.g. `{{user.username}}`) for admin detection
6. `npx convex dev` (links local dev deployment) then `npm run dev`
7. Sign in with Clerk (GitHub OAuth), open **Settings**, add your OpenRouter API key for AI triage
8. Production deployed on Vercel with GitHub auto-deploy; Convex prod env configured separately

Reviewers can use the app without their own Convex/Clerk setup by visiting the production URL. Fresh-clone setup requires their own Clerk app + Convex project (documented in README).

## Architecture summary

- **Frontend:** Vite + React SPA, dark black/yellow theme, hosted on Vercel
- **Auth:** Clerk → Convex JWT (`convex/auth.config.ts`)
- **Backend:** Convex (Postgres-like DB, realtime subscriptions, server functions, scheduled AI agent)
- **AI triage:** OpenRouter LLM (per-user BYOK key) autonomously retrieves similar past issues, ranks assignees, writes structured triage back to the ticket
- **Embeddings / RAG (optional):** OpenAI `text-embedding-3-small` per-user key for similar-issue search

```
User → Vite/React (Vercel)
     → Clerk sign-in
     → Convex queries/mutations (JWT auth)
     → issues, projects, comments, attachments
     → aiAgent (OpenRouter) on bug create → triage decision on ticket
```

Adapted from [DORA](https://github.com/kperpignant/DORA) for hackathon use (Clerk, Vercel, BYOK, NIDORA branding).

## Motivation / engagement design notes

- **Agentic triage on bug create:** When a user files a bug and has an OpenRouter key, an LLM agent runs automatically — no manual “run AI” step required for the happy path
- **Similar-issue retrieval:** Past bugs inform assignee ranking and triage rationale, reducing duplicate work and onboarding friction for new teammates
- **Structured output on the ticket:** Triage decision, suggested assignee, and reasoning are written back to the issue so the team sees actionable output, not a chat sidebar
- **BYOK in Settings:** Each teammate brings their own OpenRouter (and optional OpenAI) key so the cohort can use AI without a shared deployment secret or billing on the builder
- **Open access for teammates:** Any signed-in Clerk user can view and work on all projects; admin-only actions (create/delete projects, admin panel) stay with the builder account
- **Clear empty states:** UI prompts users to add an OpenRouter key when AI triage is unavailable, instead of failing silently

## Known limitations

- **Sole admin:** Only GitHub user `kperpignant` has admin access (project create/delete, admin panel); not configurable via UI
- **AI requires BYOK:** Auto-triage runs only if the bug creator has an OpenRouter key in Settings; no shared deployment `OPENROUTER_API_KEY`
- **BYOK tradeoff:** Per-user API keys are stored on Convex user records and are visible to Convex deployment admins — use revocable keys
- **Optional email:** Assignment notifications via Resend are optional and not required for core PM flows
- **Fresh clone needs own infra:** Reviewers cloning locally need their own Clerk + Convex projects; production URL is the primary review path
- **No GitHub issue sync:** Issues live in NIDORA only; no bidirectional GitHub Issues integration yet

## Agent usage summary

- **Research:** Cohort submission format, Convex + Clerk integration docs, DORA codebase as fork base
- **Development:** Cursor Agent ported DORA → NIDORA (Clerk auth, Vercel deploy, BYOK AI keys, theme rebrand, admin/access model)
- **Infrastructure:** Wired Convex dev/prod, Clerk JWT template, Vercel project + env vars, fixed GitHub↔Vercel auto-deploy (repo was disconnected; redeploy was reprinting old commit)
- **QA:** Verified production URL, sign-in flow, admin detection via GitHub username in JWT, project access for non-admin users
