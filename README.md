# Hult Cohort Program

[![License: MIT](https://img.shields.io/badge/License-MIT-a81202.svg)](LICENSE)
[![CI](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions/workflows/marketing-site.yml/badge.svg)](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/actions)

A cohort-based developer program at Hult International University, modeled on the Cursor Boston cohorts over a one-semester timeline.

**Open source:** curriculum, governance docs, and platform code are published under the [MIT License](LICENSE). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## The goal

Someone comes into the program, completes it successfully, and gets a job offer. That's the whole arc.

What they walk away with — practiced many times across both phases, not learned once:

1. **A deep practical understanding of GitHub.** Every project runs through it: repos, PRs, reviews, issues, merges.
2. **A deep understanding of working on a distributed team.** Coordination without direct interaction — the essence of algorithmacy.
3. **The three concrete abilities that make a distributed teammate valuable:** review others' work, produce work others will approve, contribute at a high level.

Every project re-drills the same skills against progressively less forgiving judges: peers, then live users, then investors, then open source communities of strangers.

A core operating principle: **each cohort owns its entire tool stack** — PM platform, comms, public showcase — built, selected, and operated by the cohort itself.

## Start here

- **[PROPOSAL.md](PROPOSAL.md)** — the full program proposal (EVP handoff document)
- **[WORKPLAN.md](WORKPLAN.md)** — tier status, locked decisions, ⚠️ sign-offs
- **[execution/](execution/)** — launch artifacts: legal drafts, templates, admissions repo, API spec, checklists

Program design docs are **complete**. **Backend:** Firebase (Firestore + Auth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

Next: Firebase credentials → wire Admin SDK → deploy on Vercel.

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

business/                    Pricing ($10k one-time), guarantee/refunds/buyouts,
                             placement referral fees + 10% student kickback,
                             subsidies, financial model

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
| **Site SEO** | Live: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, OG images (see `execution/marketing/site/app/`) |
| **Contribute** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Conduct** | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| **Security** | [SECURITY.md](SECURITY.md) — report vulnerabilities privately |

Fork, adapt, or reuse this curriculum for your own cohort. Student project repos in the cohort GitHub org use the MIT template in [execution/templates/cohort-project-template/](execution/templates/cohort-project-template/).
