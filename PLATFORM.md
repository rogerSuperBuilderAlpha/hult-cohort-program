# Participant platform — status and architecture

**North star:** One web surface where applicants apply, admitted participants walk through every phase and project with clear expectations, submit work as GitHub PRs, and vote on merged builds during Phase 1 contest weeks.

**Backend:** **Firebase** (Firestore + Auth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

**Explicitly out of scope (for now):** Admin dashboard. Admissions review, vote tally, and metrics run from Firebase Console, scripts, and GitHub API.

---

## Where we are today

### Complete — program design (~50 markdown files)

| Layer | Status | Location |
|-------|--------|----------|
| Curriculum (16 weeks, all projects) | ✅ | `curriculum/` |
| Governance (voting, teams, credentials) | ✅ | `governance/` |
| Assessment (metrics, peer review, pass/fail) | ✅ | `assessment/` |
| Business, partnerships, operations, legal | ✅ | `business/`, `partnerships/`, `operations/`, `institutional/` |
| Launch checklists, email templates, partner briefs | ✅ | `execution/` |

### Complete — execution artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| Marketing site + `/apply` + `/program` | ✅ Runnable Next.js | Apply API uses filesystem stub until Firebase creds wired |
| Admissions take-home repo | ✅ | Separate GitHub repo |
| Ludwitt/Hult API MVP | ✅ | Phase 2 user metrics |
| Firebase docs + schema | ✅ | [FIREBASE.md](execution/marketing/FIREBASE.md) |
| GitHub push / Vercel deploy | ❌ | Repo not initialized |

### In progress — Firebase integration

| Capability | Status |
|------------|--------|
| Firestore schema documented | ✅ |
| Admin SDK in `/api/applications` | ⏳ Pending credentials |
| GitHub Auth for participants | ⏳ Pending credentials |
| `/vote/[project]` → Firestore ballots | ⏳ Not built |
| GitHub webhook → `submissions` + `ballots` | ⏳ Not built |

---

## Target architecture

```
execution/marketing/site/     →  Next.js on Vercel
  /apply                      →  form → POST /api/applications → Firestore (Admin SDK)
  /program/*                  →  participant expectations (static)
  /vote/[project]             →  ranked ballot → Firestore (Auth required)

Firebase
  Firestore                   applications, roster, ballots, votes, submissions
  Authentication              GitHub provider for enrolled participants

GitHub org                    source of truth for PRs, reviews, merges
execution/cohort-scripts/     vote-tally, review-assignments (read Firestore export)
```

### Submission model (PR-first)

Every deliverable is a **PR**, not a form with links. Firestore `submissions` and `ballots` collections mirror merged PRs from GitHub — they do not replace PRs as proof-of-work.

| Stage | GitHub | Firestore |
|-------|--------|-----------|
| Apply | Take-home PR | `applications` doc |
| Phase 1 build | `[Project N] Submission` PR → `main` | `submissions` + ballot eligibility |
| Phase 1 vote | — | `votes/{cohort}/projects/{slug}/ballots/{handle}` |
| Phase 2 | Submission PR with metrics in body | `submissions` (optional tracking) |

**Voting (Phase 1, weeks 4 / 6 / 8):** Ballot lists eligible merged PRs from `ballots.eligiblePrs`. Participants rank top 3 on `/vote/{project}`. Tally via `vote-tally.js` + rubric tie-break.

---

## Build sequence

| Step | Deliverable | Status |
|------|-------------|--------|
| **1** | Firebase project + env vars in Vercel | ⏳ Awaiting credentials |
| **2** | Wire Admin SDK to `/api/applications` | ⏳ |
| **3** | `/program` pages | ✅ |
| **4** | GitHub Auth + `roster` gate | ⏳ |
| **5** | `/vote/[project]` + Firestore ballots | ⏳ |
| **6** | GitHub webhook → ballot feed | ⏳ |
| **7** | Push monorepo; deploy Vercel | ⏳ |

---

## Locked decisions (unchanged)

Cohort 30, $10k tuition, ranked-choice top 3, Phase 2 ≥25 users, OSS ≥1 merged PR, Discord bootstrap weeks 1–4 only. See [WORKPLAN.md](WORKPLAN.md).
