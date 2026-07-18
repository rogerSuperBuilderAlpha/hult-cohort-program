# AGENTS.md — Hult Cohort Program

Instructions for AI coding agents (Cursor, Claude Code, Copilot, etc.) working in this repository.

**License:** [MIT](LICENSE) · **Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md) · **Security:** [SECURITY.md](SECURITY.md)

---

## North star

One web surface where applicants apply, admitted participants see every project with clear expectations, submit work as **GitHub PRs**, file **written peer reviews** on GitHub, and optionally upvote with a public `Vote: up` in that review issue (or abstain). Winner = most upvotes after review week — counted by **staff CLI**, never shown as a site scoreboard.

**Live deploy:** https://site-nine-rouge-68.vercel.app (Vercel project `hult-cohort`)  
**Firebase project:** `hult-cohorts` · **Cohort id:** `summer26`

---

## Read first (by task)

| If you are… | Start here |
|-------------|------------|
| New to the repo | This file → [README.md](README.md) → live site `/start` → [content/program.ts](execution/marketing/site/content/program.ts) |
| Changing the Next.js site | [execution/marketing/site/AGENTS.md](execution/marketing/site/AGENTS.md) |
| Firebase / API / auth | [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md) |
| Program content (weeks, rubrics) | [execution/marketing/site/content/program.ts](execution/marketing/site/content/program.ts) + [curriculum/](curriculum/) |
| Contest / peer review | [contest-state-server.ts](execution/marketing/site/lib/contest-state-server.ts), UI in [PeerReviewCard.tsx](execution/marketing/site/components/PeerReviewCard.tsx), rules in [winner-selection.md](governance/winner-selection.md) |
| Admissions flow | [execution/admissions-take-home/AGENTS.md](execution/admissions-take-home/AGENTS.md), [site/app/apply/](execution/marketing/site/app/apply/) |
| **Apply / progress via MCP** | [execution/hult-cohort-mcp/](execution/hult-cohort-mcp/) (review/vote write tools retired — GitHub-native) |
| Phase 2 user metrics API | [execution/ludwitt-hult-api/AGENTS.md](execution/ludwitt-hult-api/AGENTS.md) |
| Launch / production gaps | [DEVPLAN.md](DEVPLAN.md) |
| Governance & pass gates | [governance/](governance/), [assessment/pass-fail.md](assessment/pass-fail.md) |
| Staff scripts (tally, roster) | [execution/cohort-scripts/README.md](execution/cohort-scripts/README.md) |

⚠️ **Legacy docs:** Some curriculum/operations files may still mention ranked-choice or private 👍/👎. **Implemented platform:** GitHub submissions + review issues + optional public `Vote: up`. Treat code + [content/program.ts](execution/marketing/site/content/program.ts) + [governance/winner-selection.md](governance/winner-selection.md) as source of truth.

---

## Repository map

```
HULT/
├── docs/archive/            Historical EVP proposal (PROPOSAL-evp-2026.md)
├── WORKPLAN.md              Tier status, locked decisions, sign-offs
├── DEVPLAN.md               Production checklist (P0–P3)
├── PLATFORM.md              Architecture (partially stale — see above)
├── curriculum/              Six-week Summer Pilot curriculum, rubrics, playbooks
├── governance/              Voting rules, teams, credentials
├── assessment/              Metrics, peer review, pass/fail
├── business/                ARCHIVED standalone commercial model (see ARCHIVED.md)
├── partnerships/            Hiring partners, showcase, Ludwitt/Hult
├── operations/              Calendar, admissions, lifecycle
├── institutional/           Legal risk, Hult policy
└── execution/
    ├── marketing/site/      ★ Next.js cohort platform (Vercel)
    ├── marketing/FIREBASE.md
    ├── admissions-take-home/  Applicant “fix the repo” task
    ├── ludwitt-hult-api/    Phase 2 app registration + metrics API
    ├── cohort-scripts/      vote-tally, review-assignments (CLI)
    ├── templates/           Cohort repo template, legal, emails
    └── checklists/          Cohort 1 launch
```

---

## Runnable packages

| Package | Path | Commands |
|---------|------|----------|
| Cohort platform | `execution/marketing/site/` | `npm install` · `npm run dev` · `npm run build` |
| Ludwitt/Hult API | `execution/ludwitt-hult-api/` | `npm install` · `npm test` · `npm run dev` |
| Admissions take-home | `execution/admissions-take-home/` | `npm install` · `npm test` |

Local site env: copy `execution/marketing/site/.env.example` → `.env.local`. Never commit secrets.

---

## Platform architecture (implemented)

```
Next.js (Vercel)  execution/marketing/site/
  /                    Landing
  /apply               GitHub sign-in + application form
  /overview            Public program overview
  /program             Project index
  /program/[slug]      Project detail + personal progress + peer review UI
  /api/applications    Admin SDK → Firestore applications
  /api/me              Participant status + roster gate
  /api/cohort/stats    Live enrolled count → peer review denominator
  /api/program/[slug]/progress   Submission + personal review/upvote status (GitHub)
  /api/github/webhook  PR merge + review issues → bust contest cache
  /api/cron/warm-contest  Warm fetchContestState for open review weeks

Firebase (identity only): applications, roster, survey/ack, projectOutcomes
GitHub (contest truth): merged submission PRs, review issues, optional Vote: up
  → one shared fetchContestState(slug) cached ~60s
Legacy Firestore paths (do not write): submissions/, peerWrittenReviews/, peerRatings/, ballots/
```

**Peer review flow (per peer, per Phase 1 project):**
1. Open peer deploy + PR (links from site, from GitHub contest state)  
2. File GitHub issue `Review by @{you}: @{peer}` (optional `Vote: up` in body, or abstain)  
3. Refresh progress on site — personal statuses only (needs review / abstained / upvoted)  

**Cohort size:** Dynamic from roster — `peerReviewCount = enrolledCount - 1` ([cohort-stats-server.ts](execution/marketing/site/lib/cohort-stats-server.ts)).

---

## Code conventions (all agents)

1. **Minimal diffs** — fix the task; don't refactor unrelated code.  
2. **No secrets** — `.env.local`, service account JSON, webhook secrets stay gitignored.  
3. **Split client/server** — never import `firebase-admin` into client components; use `*-server.ts` modules (see `cohort-stats-server.ts` vs `cohort-stats-types.ts`).  
4. **PR-first submissions** — deliverables are merged GitHub PRs, not form uploads.  
5. **Program text** — participant-facing copy lives in `content/program.ts`; personalize with `personalize-program.ts` (`{org}`, `{handle}`, `{peerCount}`).  
6. **Branding** — Hult 2025 cream/magenta/ink theme in `app/globals.css`, `page.module.css`, [SiteHeader.tsx](execution/marketing/site/components/SiteHeader.tsx).  
7. **Tests/build** — run `npm run build` (site) or `npm test` (API packages) before finishing.

---

## Program projects (slug → meaning)

| Slug | What students build |
|------|---------------------|
| `onboarding` | Tooling + first PR in roster repo |
| `phase-1-project-1` | PM platform for the cohort (vote week) |
| `phase-1-project-2` | Internal comms platform (vote week) |
| `phase-1-project-3` | Public showcase website (vote week) |
| `phase-1-unification` | Winners merge the three platforms |
| `phase-2-learning-app` | Learning app, ≥25 external users |
| `phase-2-venture` | Startup deck + production platform |
| `phase-2-open-source` | ≥1 merged upstream PR; starter targets include cursorboston.com, algorithmacy.org |

Full copy: [content/program.ts](execution/marketing/site/content/program.ts).

---

## Seed & dev scripts

Run from `execution/marketing/site/` with local service account:

| Script | Purpose |
|--------|---------|
| `scripts/tally-votes.ts` | Staff upvote tally from GitHub (`Vote: up`) after review week |
| `scripts/seed-demo-cohort.mjs` | Demo roster (legacy seed helpers may still touch old paths) |
| `scripts/reconcile-submissions.mjs` | Report-oriented / legacy backstop |

Staff admissions: [execution/cohort-scripts/README.md](execution/cohort-scripts/README.md).

---

## Sub-project agent guides

- [execution/marketing/site/AGENTS.md](execution/marketing/site/AGENTS.md) — Next.js app  
- [execution/ludwitt-hult-api/AGENTS.md](execution/ludwitt-hult-api/AGENTS.md) — metrics API  
- [execution/admissions-take-home/AGENTS.md](execution/admissions-take-home/AGENTS.md) — applicant task  
- [execution/templates/cohort-project-template/AGENTS.md](execution/templates/cohort-project-template/AGENTS.md) — template for student repos  

---

## Cursor rules

Project rules live in [.cursor/rules/](.cursor/rules/) and load automatically in Cursor.
