# Participant platform — status and architecture

**North star:** One web surface where applicants apply, enrolled participants walk through every phase and project with clear expectations, submit work as GitHub PRs, file written peer reviews, and cast private 👍/👎 votes during Phase 1 review weeks.

**Backend:** **Firebase** (Firestore + Auth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

**Live:** https://hult-cohort.vercel.app · Code: `execution/marketing/site/`

---

## Implemented (cohort platform)

| Capability | Status |
|------------|--------|
| `/apply` → Firestore applications | ✅ |
| GitHub Auth + roster gate | ✅ |
| `/dashboard` participant home | ✅ |
| `/program/[slug]` progress + peer review UI | ✅ |
| Written reviews → `peerWrittenReviews` | ✅ |
| Private 👍/👎 → `peerRatings` | ✅ |
| `POST /api/github/webhook` → `submissions` | ✅ (requires `GITHUB_WEBHOOK_SECRET`) |
| Enrollment resolver (admitted vs roster vs enrolled) | ✅ |
| Eligible-peer pass gates (merged ∩ roster) | ✅ |

**Not used:** ranked-choice `/vote/[project]`, Firestore `votes`/`ballots` (retired).

---

## Target architecture (current)

```
execution/marketing/site/     →  Next.js on Vercel
  /apply                      →  admissions funnel
  /dashboard                  →  enrolled participant home
  /program/[slug]             →  expectations + progress + review/vote UI
  /api/github/webhook         →  merged PRs → submissions projection

Firebase
  Firestore                   applications, roster, submissions,
                              peerWrittenReviews, peerRatings
  Authentication              GitHub provider

GitHub org                    source of truth for PRs, written reviews (issues)
execution/marketing/site/scripts/   reconcile-submissions.mjs, admissions.mjs
```

### Submission model (PR-first)

Every deliverable is a **PR**. Firestore `submissions` mirrors merged PRs from GitHub webhook (primary) or reconcile script (backstop).

| Stage | GitHub | Firestore |
|-------|--------|-----------|
| Apply | Take-home PR | `applications` |
| Phase 1 build | `[Project N] Submission` PR → `main` | `submissions/.../entries/{handle}` |
| Phase 1 review | `Review by @{you}` issue on peer repo | `peerWrittenReviews/.../entries/{reviewee}` |
| Phase 1 vote | — | `peerRatings/.../voters/{voter}` → `{ ratings: { [reviewee]: up|down } }` |

**Voting:** After written review on file per peer, cast private 👍/👎 on project page. Winner = most thumbs up. Staff tally via `tallyThumbsUp` in `lib/ratings-server.ts`.

---

## Locked decisions

Dynamic cohort size from roster; private thumbs up/down voting; Phase 2 ≥25 users; OSS ≥1 merged PR. See [WORKPLAN.md](WORKPLAN.md) and [content/program.ts](execution/marketing/site/content/program.ts).
