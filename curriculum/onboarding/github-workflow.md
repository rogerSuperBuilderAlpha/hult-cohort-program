# GitHub workflow conventions

**Purpose:** The single collaboration standard for every cohort project. All coordination happens through GitHub — coordination without direct interaction. Hiring partners navigate this trail to verify graduate skills.

---

## Repository structure

### Org naming

```
github.com/hult-cohort-{term}-{campus}/
  cohort-project-template     # shared templates
  pm-{student-github-handle}  # Project 1 builds (30 repos)
  comms-{handle}              # Project 2 builds
  showcase-{handle}           # Project 3 builds
  pm-platform                 # winning PM repo (renamed at cutover)
  comms-platform              # winning comms repo
  showcase-platform           # winning showcase repo
  ecosystem-integration       # winners' unification work
  learning-{handle}           # Phase 2 apps
  venture-{handle}            # Phase 2 ventures
```

Example: `hult-cohort-fall26-boston`

### Branching

| Branch | Use |
|--------|-----|
| `main` | Production — auto-deploys to Vercel |
| `feat/{issue-number}-{short-desc}` | Feature work |
| `fix/{issue-number}-{short-desc}` | Bug fixes |

No direct commits to `main` except by operator during cutover (documented in PR).

### Commit messages

```
type(scope): short description

feat(tasks): add assignee dropdown
fix(auth): handle expired session
docs(readme): deployment instructions
```

Enforced by convention, not CI, in Phase 1. Operators may add commit lint in later weeks.

---

## Issues

Every build must use GitHub Issues for:
- Known bugs
- Feature proposals from developer/users
- Operator roadmap items

**Issue template** (`.github/ISSUE_TEMPLATE/task.md`):

```markdown
## Type
bug / feature / chore

## Description


## Acceptance criteria
- [ ]

## Agent notes
Which agent(s) used:
```

---

## Pull requests

### PR template

```markdown
## Summary


## Test plan
- [ ] 

## Deployment URL
https://

## Agent usage
- Research:
- Development:
- QA:

## Reviewer notes
What you want feedback on:
```

### PR rules

| Rule | Value |
|------|-------|
| Min reviewers (peer build review) | 1 (the assigned reviewer); all peers review during review week |
| Min reviewers (platform contribution) | 1 operator or delegate |
| Author cannot merge own PR (platform repos) | Enforced after cutover |
| CI | Required if student sets it up; recommended |

---

## Peer review standards

A **passing peer review** ([assessment/peer-review-system.md](../../assessment/peer-review-system.md)) includes:

1. **Repo exploration evidence** — references ≥ 3 specific files/lines
2. **Deployment check** — author clicked the live URL and tested ≥ 2 flows
3. **Rubric scores** — 5 dimensions, 1–5 each (see project review rubrics)
4. **One actionable suggestion** — specific enough to implement in ≤ 2 hrs
5. **Overall recommendation** — merge / needs work / incoherent

Reviews filed as **GitHub PR reviews** on a designated "review PR" or as **issues** labeled `review/{build-repo}` — standardized in review week kickoff email.

**Minimum depth:** ≥ 150 words per review. Shorter = flagged as incomplete (counts against pass).

---

## Repo exploration curriculum (week 1, Thursday)

**60-minute workshop:** "Read a repo you've never seen."

1. Read README, LICENSE, package manifest (2 min)
2. Find entry point (5 min)
3. Trace one user action to data (15 min)
4. Skim last 20 commits (5 min)
5. Read open issues + merged PRs (10 min)
6. Write 5-question briefing for a dev agent (10 min)
7. Pair share (13 min)

This sequence is reused verbatim before Phase 2 open source targeting.

---

## Developer/user obligations (live platforms)

After each platform cutover, every non-operator student must per **4-week cycle**:

| Obligation | Minimum |
|------------|---------|
| PRs merged or open against live platform | **2** |
| Issues filed (bug or feature) | **1** |
| Reviews on others' platform PRs | **3** |

Tracked via GitHub org dashboard → cohort PM platform metrics (once live). Until PM platform live: tracked in interim spreadsheet by staff.

---

## Public GitHub trail (hiring partner navigation)

Each student's showcase profile links:

```
hult-cohort-{term}-{campus}/showcase-platform/profile/{handle}
  → GitHub profile
  → Build repos (pm-, comms-, showcase-)
  → Phase 2 repos (learning-, venture-)
  → Open source PRs (external links)
  → Review artifacts (search: author:{handle} label:review)
  → Platform contributions (search: author:{handle} org:{org})
```

Program ensures org repos are **public** unless a student opts out of public showcase (may still pass; cannot win showcase operator role).

---

## Open decisions

None.

## Depends on

- [assessment/peer-review-system.md](../../assessment/peer-review-system.md)
- [curriculum/phase-1/the-loop.md](../phase-1/the-loop.md)
- [governance/winner-selection.md](../../governance/winner-selection.md)
