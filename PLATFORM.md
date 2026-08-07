# Participant platform — status and architecture

**North star:** One web surface where applicants apply, enrolled participants walk through every phase and project with clear expectations, submit work as **GitHub PRs**, file **written peer reviews** on GitHub, and optionally upvote with a public `Vote: up` during Phase 1 review weeks. Winner = most upvotes after review week — counted by **staff CLI**, never shown as a site scoreboard.

**Backend:** **Firebase** (identity + roster + outcomes) + **GitHub** (contest truth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md) and [governance/winner-selection.md](governance/winner-selection.md).

**Live:** https://site-nine-rouge-68.vercel.app · Code: `execution/marketing/site/`

---

## Implemented (cohort platform)

| Capability | Status |
|------------|--------|
| `/apply` → Firestore applications | ✅ |
| GitHub Auth + roster gate | ✅ |
| `/dashboard` participant home | ✅ |
| `/program/[slug]` progress + peer review UI | ✅ |
| Written reviews → GitHub issues (`Review by @voter: @reviewee`) | ✅ |
| Optional public `Vote: up` in review issue body | ✅ |
| `POST /api/github/webhook` → cache bust (HMAC) | ✅ (requires `GITHUB_WEBHOOK_SECRET`) |
| Enrollment resolver (admitted vs roster vs enrolled) | ✅ |
| Eligible-peer pass gates (merged ∩ roster) | ✅ |
| Staff tally + `projectOutcomes` publish | ✅ |

**Not used:** ranked-choice `/vote/[project]`, private Firestore ballots, `peerRatings` / `peerWrittenReviews` write paths (legacy; deny-all rules).

---

## Target architecture (current)

```
execution/marketing/site/     →  Next.js on Vercel
  /apply                      →  admissions funnel
  /dashboard                  →  enrolled participant home
  /program/[slug]             →  expectations + personal progress + review UI
  /api/github/webhook         →  merged PRs / review issues → contest cache bust
  /api/cron/warm-contest      →  keep contest cache warm in open review windows

Firebase
  Firestore                   applications, roster, acknowledgments, projectOutcomes
  Authentication              GitHub provider

GitHub                        source of truth for PRs, review issues, Vote: up
execution/marketing/site/scripts/   tally-votes.ts, admissions.mjs, …
```

### Submission model (PR-first)

Every deliverable is a **PR**. The platform discovers merged submissions live from GitHub (`github-cohort-server.ts` / `fetchContestState`).

| Stage | GitHub | Platform |
|-------|--------|----------|
| Apply | Take-home PR | `applications` |
| Phase 1 build | `[Project N] Submission` PR → project branch (body includes Production URL + app repo) | Live GitHub discovery |
| Phase 1 review | `Review by @{you}: @{peer}` issue on peer app repo | Discovered via contest state |
| Phase 1 upvote | Optional `Vote: up` line in that issue body | Staff CLI tally after review week |

**Voting:** After filing a written review, optionally keep `Vote: up` (or abstain). Winner = most upvotes. Staff tally: `npx tsx scripts/tally-votes.ts --project=<slug>` or `tallyThumbsUp()` in `lib/tally-server.ts`.

---

## Locked decisions

Dynamic cohort size from roster; public optional upvote (no downvotes); Phase 2 ≥25 users; OSS ≥1 merged PR. See [WORKPLAN.md](WORKPLAN.md) and [content/program.ts](execution/marketing/site/content/program.ts).
