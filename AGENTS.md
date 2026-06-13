# AGENTS.md — Hult Cohort Program

Instructions for AI coding agents (Cursor, Claude Code, Copilot, etc.) working in this repository.

**License:** [MIT](LICENSE) · **Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md) · **Security:** [SECURITY.md](SECURITY.md)

---

## North star

One web surface where applicants apply, admitted participants see every project with clear expectations, submit work as **GitHub PRs**, file **written peer reviews** on GitHub, and cast **private 👍/👎 votes** during Phase 1 contest weeks. Winner = most thumbs up after review week.

**Live deploy:** https://site-nine-rouge-68.vercel.app (Vercel project `hult-cohort`)  
**Firebase project:** `hult-cohorts` · **Cohort id:** `fall26`

---

## Read first (by task)

| If you are… | Start here |
|-------------|------------|
| New to the repo | This file → [PROPOSAL.md](PROPOSAL.md) → [README.md](README.md) |
| Changing the Next.js site | [execution/marketing/site/AGENTS.md](execution/marketing/site/AGENTS.md) |
| Firebase / API / auth | [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md) |
| Program content (weeks, rubrics) | [execution/marketing/site/content/program.ts](execution/marketing/site/content/program.ts) + [curriculum/](curriculum/) |
| Voting / peer review logic | [execution/marketing/site/lib/ratings-server.ts](execution/marketing/site/lib/ratings-server.ts), [written-reviews-server.ts](execution/marketing/site/lib/written-reviews-server.ts), UI in [ProjectProgressPanel.tsx](execution/marketing/site/components/ProjectProgressPanel.tsx) |
| Admissions flow | [execution/admissions-take-home/AGENTS.md](execution/admissions-take-home/AGENTS.md), [site/app/apply/](execution/marketing/site/app/apply/) |
| Phase 2 user metrics API | [execution/ludwitt-hult-api/AGENTS.md](execution/ludwitt-hult-api/AGENTS.md) |
| Launch / production gaps | [DEVPLAN.md](DEVPLAN.md) |
| Governance & pass gates | [governance/](governance/), [assessment/pass-fail.md](assessment/pass-fail.md) |
| Staff scripts (tally, roster) | [execution/cohort-scripts/README.md](execution/cohort-scripts/README.md) |

⚠️ **Stale docs:** [PLATFORM.md](PLATFORM.md) and [governance/winner-selection.md](governance/winner-selection.md) still describe ranked-choice top-3 voting. **Implemented platform uses private 👍/👎 after written GitHub reviews.** Treat code + [content/program.ts](execution/marketing/site/content/program.ts) as source of truth until governance docs are updated.

---

## Repository map

```
HULT/
├── PROPOSAL.md              EVP proposal — program vision
├── WORKPLAN.md              Tier status, locked decisions, sign-offs
├── DEVPLAN.md               Production checklist (P0–P3)
├── PLATFORM.md              Architecture (partially stale — see above)
├── curriculum/              16-week curriculum, rubrics, playbooks
├── governance/              Voting rules, teams, credentials
├── assessment/              Metrics, peer review, pass/fail
├── business/                Pricing, guarantee, financial model
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
  /program/[slug]      Project detail + participant progress + peer review UI
  /api/applications    Admin SDK → Firestore applications
  /api/me              Participant status + roster gate
  /api/cohort/stats    Live enrolled count → peer review denominator
  /api/program/[slug]/progress      Submission + reviews + votes per user
  /api/program/[slug]/written-reviews   Save GitHub issue URL (review gate)
  /api/program/[slug]/ratings     Private 👍/👎 (requires written review)

Firestore (hult-cohorts)
  applications/{id}
  roster/fall26/members/{githubHandle}
  submissions/fall26/projects/{slug}/entries/{handle}
  peerWrittenReviews/fall26/projects/{slug}/reviewers/{voter}/reviews/{reviewee}
  peerRatings/fall26/projects/{slug}/voters/{voter}  → { ratings: { [reviewee]: 'up'|'down' } }
  ballots/...          Legacy/eligibility feed (eligible PR list)
```

**Peer review flow (per peer, per Phase 1 project):**
1. Try deploy → read submission PR  
2. File GitHub issue `Review by @{you}` on their repo  
3. Paste issue URL on platform → unlocks vote  
4. Cast private 👍 or 👎  

**Cohort size:** Dynamic from roster — `peerReviewCount = enrolledCount - 1` ([cohort-stats-server.ts](execution/marketing/site/lib/cohort-stats-server.ts)).

---

## Code conventions (all agents)

1. **Minimal diffs** — fix the task; don't refactor unrelated code.  
2. **No secrets** — `.env.local`, service account JSON, webhook secrets stay gitignored.  
3. **Split client/server** — never import `firebase-admin` into client components; use `*-server.ts` modules (see `cohort-stats-server.ts` vs `cohort-stats-types.ts`).  
4. **PR-first submissions** — deliverables are merged GitHub PRs, not form uploads.  
5. **Program text** — participant-facing copy lives in `content/program.ts`; personalize with `personalize-program.ts` (`{org}`, `{handle}`, `{peerCount}`).  
6. **Branding** — Hult ivory/red/sage theme in `app/globals.css`, `page.module.css`, [SiteHeader.tsx](execution/marketing/site/components/SiteHeader.tsx).  
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
| `scripts/seed-demo-cohort.mjs` | Demo roster + submissions + ballots |
| `scripts/seed-peer-reviews.mjs` | Sample peer ratings |
| `scripts/migrate-peer-ratings.mjs` | Migrate legacy peerReviews → peerRatings |
| `scripts/backfill-roster-submissions.mjs` | Backfill submission entries |

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
