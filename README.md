# Hult Cohort Program

[![License: MIT](https://img.shields.io/badge/License-MIT-a81202.svg)](LICENSE)
[![CI](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions/workflows/marketing-site.yml/badge.svg)](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions)

A for-credit developer elective within the Hult **Computer Science for Business** undergraduate degree—GitHub-native projects over one semester.

**Open source:** curriculum, governance docs, and platform code are published under the [MIT License](LICENSE). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## What it is

Students in the elective complete six production projects on GitHub: peer review in Phase 1, external users and maintainers in Phase 2. The cohort platform tracks submissions, written reviews, and private votes.

## Start here

- **Live site:** https://site-nine-rouge-68.vercel.app/start — visual intro for newcomers
- **[execution/marketing/site/content/program.ts](execution/marketing/site/content/program.ts)** — project copy (source of truth for weeks)
- **[AGENTS.md](AGENTS.md)** — map for AI agents and contributors
- **[WORKPLAN.md](WORKPLAN.md)** · **[DEVPLAN.md](DEVPLAN.md)** — launch status and production checklist
- **Archive:** [docs/archive/PROPOSAL-evp-2026.md](docs/archive/PROPOSAL-evp-2026.md) (historical EVP proposal)

Program design docs are expanded; **backend:** Firebase (Firestore + Auth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

## Repository map

Every leaf file states what's decided and carries a `To flesh out` checklist — each one is a self-contained work unit.

```
curriculum/                  The 16-week program itself
  onboarding/                Week 1: agent setup, GitHub workflow, tooling
  phase-1/                   Weeks 2–8: internal — the cohort builds its own stack
    the-loop.md              The build → review → operate cycle
    project-1-pm-platform/   Requirements, review rubric, operator handbook
    project-2-comms-platform/
    project-3-public-showcase/
    ecosystem-unification.md Winners merge the three platforms
  phase-2/                   Weeks 9–16: external — judged by the market
    project-1-learning-app/  Build on Ludwitt/Hult; metric: users
    project-2-venture/       Market research, plan, investor materials, app
    project-3-open-source/   Merged PRs in large repos (continuous)

governance/                  Winner voting, team formation (3 winners + 10% picks),
                             removal/succession, Law Review-style credentials

assessment/                  Metrics, peer review system, pass/fail,
                             job-offer readiness

business/                    ARCHIVED — retired standalone pricing/guarantee model (see ARCHIVED.md)

partnerships/                Hiring partners, week-16 showcase event,
                             Ludwitt/Hult platform readiness

operations/                  Cohort lifecycle, admissions, calendar,
                             cohort-owned tooling, repeat enrollment, staffing

institutional/               Hult policy compatibility, legal and risk

execution/                   Launch-ready artifacts (legal drafts, templates, admissions repo)
  admissions-take-home/      "Fix the repo" task for applicants
  ludwitt-hult-api/          OpenAPI spec for platform MVP
  templates/                 Cohort GitHub template, venture, legal, showcase
  checklists/                Cohort 1 launch checklist
  partners/                  Partner pitch outline
```

## Working in this repo

**Design phase:** complete — all curriculum, governance, assessment, and business docs are expanded.

**Execution phase:** use [execution/](execution/) — includes a **runnable Next.js landing page** (`execution/marketing/site`), Ludwitt/Hult API, admissions take-home, and launch checklists.

**AI agents:** read [AGENTS.md](AGENTS.md) first.

Live demo: [site-nine-rouge-68.vercel.app](https://site-nine-rouge-68.vercel.app) (requires Firebase env on deploy).

## Open source

| | |
|---|---|
| **License** | [MIT](LICENSE) |
| **Agents** | [AGENTS.md](AGENTS.md) · [llms.txt](llms.txt) · [.cursor/rules/](.cursor/rules/) |
| **Hult Cohort MCP** | [execution/hult-cohort-mcp/AGENTS.md](execution/hult-cohort-mcp/AGENTS.md) — apply, reviews, votes via MCP |
| **Site SEO** | Live: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, OG images (see `execution/marketing/site/app/`) |
| **Contribute** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Conduct** | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| **Security** | [SECURITY.md](SECURITY.md) — report vulnerabilities privately |

Fork, adapt, or reuse this curriculum for your own cohort. Student project repos in the cohort GitHub org use the MIT template in [execution/templates/cohort-project-template/](execution/templates/cohort-project-template/).
