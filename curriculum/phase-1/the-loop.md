# The loop: build → review → operate

**Purpose:** The four-step Phase 1 cycle every project follows. Project-specific folders only document what differs (requirements, rubric weights, operator SLAs).

---

## Overview

```
BUILD (varies by project: 1–2 weeks)
  → REVIEW (3 days)
  → VOTE (closes 48 hrs after review opens)
  → OPERATE (through semester end)
  → DEVELOPER/USER (everyone else, continuous)
```

Calendar dates: [operations/calendar.md](../../operations/calendar.md)

---

## Step 1: Build

### Kickoff (Tuesday 10:00)

Program director delivers:
- Project brief (from project folder `requirements.md`)
- Review rubric preview
- Deployment deadline
- "Eligible build" checklist

### Build window

| Project | Build days | Deploy deadline |
|---------|------------|-----------------|
| Project 1 (PM) | 10 days (Tue w2 – Thu w4) | Thu Oct 2, 17:00 |
| Project 2 (comms) | 7 days | Thu Oct 16, 17:00 |
| Project 3 (showcase) | 7 days | Thu Oct 30, 17:00 |

### Eligible build checklist

To appear on the review ballot, student's **submission PR must be merged to `main`** by deploy deadline. The PR body is the proof-of-work record — no separate link submission form.

Merged PR must include:

- [ ] Public GitHub repo in cohort org (`pm-{handle}`, etc.)
- [ ] `README.md` with setup + architecture + known limitations
- [ ] Production HTTPS URL in PR body (Vercel or equivalent)
- [ ] URL loads; core flow demonstrable in ≤ 5 min
- [ ] `AGENTS.md` present
- [ ] Staff smoke-test: program director clicks URL — if down at deadline, **ineligible**

Unmerged PRs may still receive peer reviews but **cannot appear on the vote ballot**.

### What's provided vs discovered

| Provided | Discovered by student |
|----------|----------------------|
| Org template repo | Stack choice |
| Brief + rubric | Architecture |
| Deployment workshop (week 1) | Hosting config |
| Peer cohort as beta users (after cutover) | Ecosystem design |

---

## Step 2: Review

### Mechanics

1. **Mon 10:00:** Review window opens. Platform + `#reviews` post lists all **merged submission PRs** (interim Discord weeks 2–4; cohort PM platform after cutover).
2. Each student assigned **3 mandatory deep reviews** (different peers) via round-robin; must complete **all 29** by deadline.
3. Reviews filed per [peer-review-system.md](../../assessment/peer-review-system.md).
4. **Wed 14:00:** Checkpoint — ≥ 10 reviews submitted or student flagged.
5. **Fri 14:00:** All reviews due.

### Time budget

At cohort 30: 29 reviews × ~45 min = ~22 hrs. Agents reduce repo archaeology time; human must still judge product and write feedback. Expected: 25–30 hrs that week — plan accordingly.

---

## Step 3: Vote

See [governance/winner-selection.md](../../governance/winner-selection.md).

- **Method:** Ranked choice — rank top 3 **merged submission PRs**
- **Self-votes:** Own submission PR cannot appear on ballot
- **Ballot:** Private to staff; ranked results public after winner announced
- **Platform:** Participants vote on cohort site `/vote/{project}` during review week (replaces Google Form)
- **Closes:** Fri 16:00 review week
- **Winner announced:** Following Mon 10:00 kickoff

### Tie-break

Instant runoff on ranked ballots. If still tied: higher median rubric score across all peer reviews (see [assessment/peer-review-system.md](../../assessment/peer-review-system.md)). If still tied: program director selects based on production readiness.

---

## Step 4: Operate (winner)

### Cutover (48 hrs post-announcement)

| Hour | Action |
|------|--------|
| 0 | Winning repo renamed/transferred to canonical name (`pm-platform`, etc.) |
| 0–24 | Winner files `CUTOVER.md` issue: accounts, data migration, DNS |
| 24–48 | All cohort members have login; old URLs redirect or deprecated |
| 48 | Operator on-call; non-operator PRs accepted |

**Interim if cutover fails 48 hr deadline:** Runner-up by vote count operates until original winner completes cutover or is removed.

### Operator SLAs

| Metric | Target |
|--------|--------|
| Platform uptime | ≥ 99% during business hours (8am–8pm cohort TZ) |
| PR triage (first response) | ≤ 24 hrs |
| PR merge decision | ≤ 72 hrs |
| Release cadence | ≥ 1 user-visible release every 2 weeks |
| Release notes | Posted for every release |

Tracked on cohort PM platform once live. Violations → [governance/removal-succession.md](../../governance/removal-succession.md).

---

## Step 5: Developer/users (everyone else)

During operate phase, non-winners:
- Use the platform daily for cohort work
- Submit ≥ 2 PRs + 1 issue per 4-week cycle ([github-workflow.md](../onboarding/github-workflow.md))
- Review others' platform PRs (≥ 3 per cycle)

This is the "developer/user" skill — not just consuming internal tools but improving them.

---

## Non-winning builds

| Asset | Fate |
|-------|------|
| Repo | **Archived** (`archived` flag) — public, read-only, portfolio artifact |
| Deploy URL | May stay live at student expense or shut down — student's choice |
| Good ideas | Encouraged to contribute to winner via PR, not fork |

Cannibalization via PR is preferred over maintaining 30 forks.

---

## One student winning multiple projects

**Allowed.** One student may win 0, 1, 2, or 3 platforms.

If one student wins multiple:
- They operate multiple platforms (heavy load — repeat enrollment next term is the relief valve)
- They pick **10% for each platform they won** (can pick same person twice if they're ≤ 30% of one person — cap: no student on more than **2** leadership teams)
- Showcase unification still requires collaboration with other winners

---

## Open decisions

None.

## Depends on

- [governance/winner-selection.md](../../governance/winner-selection.md)
- [assessment/peer-review-system.md](../../assessment/peer-review-system.md)
- [operations/calendar.md](../../operations/calendar.md)
