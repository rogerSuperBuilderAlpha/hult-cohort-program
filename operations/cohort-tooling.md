# Cohort tooling: each cohort owns its entire stack

**Purpose:** Operational rules for the principle that every cohort builds, selects, and operates its own PM platform, comms platform, and public showcase — nothing inherited from the program or prior cohorts.

---

## What the program provides vs never provides

| Program provides | Program never provides |
|------------------|------------------------|
| GitHub org + templates | Deployed PM/comms/showcase software |
| Discord server (bootstrap only — see below) | Staff-built internal tools for the cohort |
| Curriculum briefs and rubrics | Previous cohort's live platforms |
| Deployment workshops | Licensed SaaS the cohort should build instead |
| Staff facilitation (kickoffs, vote admin) | |

**Line:** Program gives **infrastructure and curriculum**. Cohort gives **all operational software**.

---

## The bootstrap problem (weeks 1–4)

The cohort's PM platform doesn't exist until **week 4 cutover**. Weeks 1–4 use **deliberately disposable interim tooling**:

| Function | Weeks 1–4 interim | Retired when |
|----------|-------------------|--------------|
| Announcements | `#announcements` Discord | PM platform notifications live |
| Reviews list | `#reviews` Discord + pinned spreadsheet | PM platform review module or issues |
| Schedule | Google Calendar (shared) | PM platform calendar |
| Vote ballots | Google Form | PM platform voting feature (Project 2+) |
| Setup verification | `#setup-verification` Discord | PM platform onboarding |

**Discord is interim, not the comms platform.** It is explicitly labeled "bootstrap tooling" in week 1 kickoff. The comms platform winner's job includes migrating cohort comms off Discord.

Staff post in Discord weeks 1–4 only. After comms cutover (week 6), staff use the cohort's comms platform like everyone else.

---

## Prior cohort ecosystems

All cohort repos are **public**. Sealing prior work is impossible.

**Originality expectation:** Students may read prior cohort repos for inspiration but **must not fork or copy substantial code** into contest submissions. Plagiarism detection: staff spot-check + peer familiarity with prior cohorts.

Prior cohort showcase sites remain live as **portfolio archives** — marketing for the program, reference for new students.

---

## End-of-cohort ownership

| Asset | After week 16 |
|-------|---------------|
| `pm-platform`, `comms-platform`, `showcase-platform` | **Operator + team maintain through placement window** (6 mo); then archived or handed to alumni association — operator decides |
| Personal build repos (`pm-{handle}`, etc.) | Student owns forever |
| Org membership | Alumni emeritus read access |

No requirement to keep platforms running post-placement, but doing so strengthens operator credential.

---

## Staff relationship to cohort platforms

After cutover, **staff are developer/users**, not admins:

- Staff file issues and PRs like any student
- Staff do not merge to `main` on platform repos without operator approval
- Program director uses platforms for vote administration features once built

Dogfooding proves the platforms work and models the developer/user skill.

---

## Open decisions

None.

## Depends on

- [cohort-lifecycle.md](cohort-lifecycle.md)
- [curriculum/phase-1/the-loop.md](../curriculum/phase-1/the-loop.md)
- [curriculum/onboarding/tooling-setup.md](../curriculum/onboarding/tooling-setup.md)
