# The loop: build → review → operate

**Purpose:** The four-step Phase 1 cycle every project follows. Project-specific folders only document what differs (requirements, rubric weights, operator SLAs).

---

## Overview

```
BUILD (Mon → Fri 17:00 ET present)
  → MERGE (Sun 17:00 ET — submission PRs merged; review window opens)
  → REVIEW + VOTE (Sun 17:00 → Mon 17:00 ET)
  → WINNER (Mon 18:00 ET live session)
  → OPERATE (through pilot end)
  → DEVELOPER/USER (everyone else, continuous)
```

**The weekly clock, every contest week:** Friday 17:00 ET present · Sunday 17:00 ET submissions merged and voting opens · Monday 17:00 ET reviews finished · Monday 18:00 ET winner announced.

Calendar dates: [operations/calendar.md](../../operations/calendar.md) · ISO timestamps: [content/program.ts](../../execution/marketing/site/content/program.ts)

---

## Step 1: Build

### Kickoff (Monday)

Program director delivers:
- Project brief (from project folder `requirements.md`)
- Review rubric preview
- Merge deadline (Sunday 17:00 ET)
- "Eligible build" checklist

### Present (Friday 17:00 ET)

Builders demo the platform and make the case for it — what it does, why the cohort should run on it. Presenting is not a merge gate; it is where opinions form before reviews open.

### Build window (Summer Pilot — compressed)

| Project | Week | Present | Merge deadline | Reviews close |
|---------|------|---------|----------------|---------------|
| Project 1 (PM) | 1 | Fri Jul 17, 17:00 ET | Sun Jul 19, 17:00 ET | Mon Jul 20, 17:00 ET |
| Project 2 (comms) | 2 | Fri Jul 24, 17:00 ET | Sun Jul 26, 17:00 ET | Mon Jul 27, 17:00 ET |
| Project 3 (showcase) | 3 | Fri Jul 31, 17:00 ET | Sun Aug 2, 17:00 ET | Mon Aug 3, 17:00 ET |

### Eligible build checklist

To appear on the peer review/vote list, student's **submission PR must be merged** to the project branch by the Sunday 17:00 ET merge deadline. The PR body (filled template) is the proof-of-work record — no separate link submission form, and **no real cohort signup quota before merge**.

Merged PR must include:

- [ ] Public GitHub repo in cohort org (`pm-{handle}`, etc.)
- [ ] `README.md` with setup + architecture + known limitations
- [ ] Production HTTPS URL in PR body (Vercel or equivalent)
- [ ] URL loads; core flow demonstrable in ≤ 5 min
- [ ] `AGENTS.md` present
- [ ] Staff smoke-test: program director clicks URL — if down at deadline, **ineligible**

Unmerged PRs may still receive peer reviews but **cannot appear on the eligible peer list** for votes.

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

1. **Sun 17:00 ET:** Submission PRs merged; review window opens. Platform lists all **merged submission PRs** (interim Discord weeks 1–2; cohort PM platform after week 2 cutover).
2. Each student must review **every eligible peer** (active roster + merged submission) by deadline. Primary deep reviews (≥300 words) may still use a staff round-robin of 3 for quality sampling; pass gate is all-peers coverage.
3. Reviews filed as GitHub issues `Review by @{you}: @{peer}` on the peer’s app repo per [peer-review-system.md](../../assessment/peer-review-system.md) and [winner-selection.md](../../governance/winner-selection.md).
4. **Mon 17:00 ET:** All reviews due — the window runs a full 24 hours from open to close.

### Time budget

At cohort 30: 29 reviews × ~45 min = ~22 hrs. Agents reduce repo archaeology time; human must still judge product and write feedback. Expected: 25–30 hrs that week — plan accordingly.

---

## Step 3: Vote

See [governance/winner-selection.md](../../governance/winner-selection.md).

- **Method:** Optional public `Vote: up` in the written review issue body (or abstain — no downvotes)
- **Self-votes:** Cannot review or vote on own submission
- **Visibility:** Reviews and upvotes are public on GitHub; live tallies are never shown on the site
- **Platform:** `/program/{slug}` → progress panel (personal status only); staff tally via CLI
- **Closes:** Mon 17:00 ET, with the reviews (upvotes live in the review issues — see `content/program.ts` schedule per project)
- **Winner announced:** Mon 18:00 ET live session, one hour after the window closes

### Tie-break

Most upvotes wins. If tied: earliest submission `mergedAt`, then handle sort. Persistent ties: rubric median / staff judgment per [winner-selection.md](../../governance/winner-selection.md).

---

## Step 4: Operate (winner)

### Cutover (before next kickoff)

| Hour | Action |
|------|--------|
| 0 | Winning repo renamed/transferred to canonical name (`pm-platform`, etc.) |
| 0–24 | Winner files `CUTOVER.md` issue: accounts, data migration, DNS |
| 24–48 | All cohort members have login; old URLs redirect or deprecated |
| 48 | Operator on-call; non-operator PRs accepted |

**Interim if cutover fails before next kickoff:** Runner-up by vote count operates until original winner completes cutover or is removed.

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
- Submit ≥ 2 PRs + 1 issue per weekly cycle during weeks 5–7 ([github-workflow.md](../onboarding/github-workflow.md))
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
