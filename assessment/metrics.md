# Metrics

**Purpose:** Operational definitions for every gradable signal — ungameable, automatable where possible, displayed on the cohort's own PM platform once live.

---

## Design principles

1. **Mechanical over subjective** — staff judgment only at margins
2. **Public trail** — GitHub and platform logs, not self-report
3. **Anti-gaming** — cohort members cannot inflate each other's external metrics
4. **Pass/fail gates** — thresholds below; job-offer readiness uses context on top ([job-offer-readiness.md](job-offer-readiness.md))

---

## Phase 1: builds

| Metric | Definition | Collection | Pass gate |
|--------|------------|------------|-----------|
| **Reviews submitted** | GitHub issues titled `Review by @{reviewer}` on eligible peer repos during review window | GitHub API + platform `peerWrittenReviews` | `{peerCount}/{peerCount}` per contest project (eligible merged peers only) |
| **Review quality** | Median peer spot-check score ≥ 3/5 (5% sample) | Staff sample | No gate; distinction only |
| **Vote participation** | Private 👍/👎 cast for every **eligible** peer (merged submission + active roster) after written review on file | Firestore `peerRatings` | All eligible peers per contest project (dynamic `{peerCount}`) |
| **Build eligibility** | Submission PR merged + deploy URL passes smoke-test at deadline | GitHub API + staff checklist | 2/3 builds eligible (1 miss allowed with overall pass review) |
| **Rubric score (received)** | Median total /25 across peer reviews | GitHub issue parser | Advisory only |

---

## Phase 1: operators

Measured on `pm-platform`, `comms-platform`, `showcase-platform` repos.

| Metric | Definition | Collection | Pass gate (operator credential) |
|--------|------------|------------|--------------------------------|
| **Uptime** | % of 5-min pings returning 200, Mon–Fri 8am–8pm cohort TZ | UptimeRobot free tier → PM dashboard | ≥ 99% weekly avg |
| **PR triage response** | Time from PR open → first operator comment | GitHub API | Median ≤ 24 hrs |
| **PR merge decision** | Time from PR open → merge or close | GitHub API | Median ≤ 72 hrs |
| **Release cadence** | GitHub Release or tagged deploy with release notes | GitHub API | ≥ 1 per 2 weeks |
| **User satisfaction** | Monthly 1–5 pulse: "PM/comms/showcase works for me" | Form on platform | Avg ≥ 3.5 |

Operators failing credential gates keep **Winner** credential; lose **Operator** credential ([credentials.md](../governance/credentials.md)).

---

## Phase 1: developer/users

Per 4-week cycle on live platforms ([github-workflow.md](../curriculum/onboarding/github-workflow.md)):

| Metric | Definition | Pass gate (per cycle) |
|--------|------------|----------------------|
| **Platform PRs** | Merged or open PRs to platform repos (not own build repo) | ≥ 2 |
| **Platform issues** | Issues filed (bug/feature) | ≥ 1 |
| **Platform PR reviews** | Reviews on others' platform PRs | ≥ 3 |

Cycles: weeks 5–8, 9–12, 13–16. Must pass **2/3 cycles** to pass cohort.

---

## Phase 2: learning app

| Metric | Definition | Collection | Pass gate |
|--------|------------|------------|-----------|
| **User count** | **Unique external users** completing ≥ 1 learning action (lesson start, quiz submit, or ≥ 2 min session) | Ludwitt/Hult platform analytics (primary) or self-hosted Plausible with UTM | ≥ **25 users** by Fri week 11 snapshot |
| **Integration** | App listed and reachable via Ludwitt/Hult launcher | Platform admin check | Required for metric to count |

### User definition (anti-gaming)

| Counts | Does not count |
|--------|----------------|
| Unique device/IP not in cohort roster | Cohort member accounts |
| Verified email unique | Same person > 1 account (dedupe by email) |
| ≥ 1 learning action | Page view only |
| External traffic | Paid bot traffic (filter: > 50 signups/hr flagged) |

Cohort members **must not** register as users on each other's apps. Honor code + analytics filter.

---

## Phase 2: venture

| Metric | Definition | Collection | Pass gate |
|--------|------------|------------|-----------|
| **Venture users** | Same as learning app | App analytics | ≥ **25 external users** by Fri week 14 |
| **Investor interest** | ≥ 1 **qualified investor touchpoint** | Placement lead verification | ≥ 1 |

### Investor interest definition

| Qualifies | Does not qualify |
|-----------|------------------|
| Scheduled call with angel, VC, or corp dev | Friend saying "cool idea" |
| Written feedback on deck from investor | Peer student |
| Demo day RSVP + attendance from investor list | Program staff |
| LOI or term sheet (any stage) | Self-emailed deck with no response |

Log in venture repo `INVESTOR_LOG.md` with date, name, firm, outcome. Placement lead verifies ≥ 1 entry.

---

## Phase 2: open source

| Metric | Definition | Collection | Pass gate |
|--------|------------|------------|-----------|
| **Merged PRs** | PR merged to repo with ≥ **1,000 stars** OR ≥ **50 contributors** in last 90 days | GitHub public API | ≥ **1 merged PR** by week 16 |
| **Quality PRs (distinction)** | Merged PR changing ≥ 10 lines excluding docs | GitHub API | Advisory |

### Repo qualification

Checked at PR open time:
- `stargazers_count ≥ 1000` OR
- `contributors ≥ 50` (approximate via API) OR
- Listed in cohort `qualified-repos.md` (maintainer-approved list)

**Strong unmerged PR:** Does not pass gate. Does count for job-offer readiness narrative if maintainer engaged (review comments ≥ 2).

---

## Dashboards

| Phase | Dashboard location |
|-------|-------------------|
| Weeks 1–4 | Staff spreadsheet `cohort-metrics-fall26` |
| Weeks 5–16 | **Cohort PM platform** metrics module (operator builds or seeds manually week 5) |
| Week 16+ | Showcase platform public profiles |

Automated feeds:
- GitHub org webhook → PM platform (or nightly cron script in `cohort-scripts` repo)
- Ludwitt/Hult analytics API → PM platform (week 9+)

---

## Thresholds vs ranking

| Use | Type |
|-----|------|
| Pass/fail per unit | **Fixed threshold** (tables above) |
| Winner selection | **Vote** (not metric-ranked) |
| Job-offer readiness | **Threshold + staff judgment** |
| Distinction / showcase featuring | **Relative ranking** among passers |

---

## Open decisions

None.

## Depends on

- [peer-review-system.md](peer-review-system.md)
- [pass-fail.md](pass-fail.md)
- [job-offer-readiness.md](job-offer-readiness.md)
- [../partnerships/ludwitt-hult-platform.md](../partnerships/ludwitt-hult-platform.md)
