# Proposal: Hult Cohort Developer Program

**Prepared for:** EVP review
**Date:** June 12, 2026
**Status:** Draft for approval

---

## Executive summary

We propose a cohort-based developer program at Hult International University with a simple promise: **a student enrolls, completes the program successfully, and gets a job offer.**

The program is modeled on the Cursor Boston cohorts, adapted to a semester timeline. Students spend the program doing the one thing the modern software job market actually pays for, over and over: collaborating with other developers through GitHub — reviewing others' work, producing work others approve, and contributing at a high level to codebases they don't own. We call this skill *algorithmacy*: coordination without direct interaction.

The business model is aligned end to end. Students pay a one-time fee and may attend unlimited cohorts until placed. Revenue comes primarily from employer referral fees on placement, 10% of which is paid back to the student. Marginal cost per student is near zero, so larger cohorts are better, not worse.

---

## 1. The outcome we're selling

Every graduate walks away with three abilities, each practiced many times and each leaving a **public, independently verifiable GitHub trail**:

1. **Review others' work** — every student reviews every peer's build on every internal project, and platform operators triage incoming pull requests all semester.
2. **Produce work others will approve** — peers vote on builds, real users adopt their apps, investors respond to their materials, and open source maintainers merge their pull requests.
3. **Contribute at a high level** — from pull requests against the cohort's own live platforms to merged pull requests in major open source projects.

The curriculum does not teach different skills in different units. It re-drills these same three skills against progressively less forgiving judges: first peers, then live users, then investors, then open source communities of strangers. Hiring partners never have to take our word for a graduate's ability — they can inspect the evidence directly on GitHub.

Students also learn to set up and direct AI agents — research, development, and QA agents matched to the task — which is how high-output individual developers now work. The program is agent-first from day one.

---

## 2. Program structure

Two phases. Phase 1 is internal: the cohort builds the software it runs on. Phase 2 is external: students ship to the real world and are judged by the market.

### Phase 1: Internal (three projects, one repeating loop)

Every Phase 1 project follows the same four-step loop:

1. **Everyone builds.** Each student individually ships a production deployment. They learn production fundamentals and ecosystem thinking.
2. **Everyone reviews everyone.** Each student reviews every other build and votes for a winner. This trains repo exploration, code review, and judgment.
3. **The winner operates.** The winning build becomes the cohort's live platform for the rest of the program. The winner manages, optimizes, and innovates a real ecosystem with live users.
4. **Everyone else engages as developer/users.** Students use the platform daily and submit pull requests to fix features or propose ideas. This matters because companies everywhere are now building their own internal tools — graduates must be fluent as developer/users, not just users.

The three projects:

| Project | Deliverable | Becomes |
|---------|-------------|---------|
| 1 | Project management platform | The cohort's actual PM system for the semester |
| 2 | Internal communications platform | The cohort's comms layer |
| 3 | Public-facing showcase platform | The cohort's face to hiring partners, who visit to review the cohort's work |

Project 3 is the public side of the PM platform, so **the three winners must integrate their platforms into one unified ecosystem** — the program's first forced leadership collaboration.

A core principle: **each cohort owns its entire tool stack.** The PM platform, the comms platform, and the public showcase are all built by the cohort, selected by the cohort, and operated by the cohort. Nothing is handed down from the program or inherited from a previous cohort. This is deliberate — teams everywhere now build their own internal tooling, and graduates must be fluent as developer/users of systems their own community owns, not just consumers of someone else's software.

### Leadership teams and recognition

After Phase 1, each winner selects 10% of the cohort for their team. In a cohort of 30, that's 3 winners + 9 picks = **12 students in recognized leadership roles**, jointly operating the unified ecosystem. This teaches hierarchy, team dynamics, and management with real stakes, and functions as a distinction credential — the program's equivalent of making the Harvard Law Review, except verifiable in a public commit history.

Leadership is conditional, not permanent. Teams can underperform, leaders can be removed or step down. There is always a path for others to step up and a standing incentive for leaders to perform.

### Phase 2: External (three projects, judged by the market)

| Project | Task | Success metric |
|---------|------|----------------|
| 1 — Platform integration | Build a learning app on any topic and integrate it into the Ludwitt/Hult learning platform, then promote it publicly | Number of users |
| 2 — Entrepreneurship | Research a market; produce a full business plan, market research packet, and investor materials; deploy a production-grade application | Users and investor interest |
| 3 — Open source | Target large open source repositories and get pull requests merged | Merged PRs |

Project 3 is the capstone: getting work approved by a maintainer community that has no stake in the student's success is the strongest possible social proof, and demonstrates to hiring partners that the graduate can enter a large unfamiliar codebase, find real issues, and fix them to a stranger's standards.

### Semester pacing (both phases, one semester)

The full program runs in **a single semester**. This is still a slower pace per project than the Cursor Boston cohorts the program is modeled on.

| Weeks | Activity |
|-------|----------|
| 1 | Onboarding: agent setup, GitHub workflow, tooling |
| 2–4 | Phase 1 Project 1: build, review, winner selection; PM platform goes live |
| 5–6 | Phase 1 Project 2: build, review, winner selection; comms platform goes live |
| 7–8 | Phase 1 Project 3: build, review; ecosystem unification; leadership team selection |
| 9–11 | Phase 2 Project 1: learning app built, integrated into Ludwitt/Hult, promoted |
| 12–15 | Phase 2 Project 2: market research, business plan, investor materials, production app |
| 9–16 | Phase 2 Project 3: open source contributions (runs continuously — merges take time) |
| 16 | Hiring partner showcase and review |

The pace is intentionally demanding. The pressure valve is structural: **students can opt to join cohort after cohort on their single fee**, so anyone who wants more reps — or who won a platform and wants a cohort focused purely on operating it — simply enrolls again. Repeat enrollment is a normal path through the program, not a remedial one.

---

## 3. Assessment

Cohorts are **pass/fail**. Most grading is mechanical and peer-driven, requiring minimal staff time:

- Phase 1: peer reviews, winner votes, platform uptime and PR-triage responsiveness
- Phase 2: user counts, investor interest, merged PRs — measured by the market, not by us

Staff's role is narrow: determine suitability for a job offer, which the market largely decides for us through hiring partners reviewing public work.

A student who doesn't pass may join the next cohort at no additional cost, or quit for a refund.

---

## 4. Business model

### Student pays

- **One-time tuition** (working figure: $10,000)
- **Tooling at their own cost:** $200/month Claude Code + $200/month Cursor subscriptions. Both, deliberately — graduates should be fluent in both. This is sufficient compute for every project in the program.

### The guarantee

- One payment covers **unlimited cohort enrollments until the student receives a job offer** — whether retaking after a failed cohort or simply opting in again for more reps
- Students may quit at any time for a refund
- The program reserves a buyout option (e.g., $5,000 to exit a poor-fit student) — cheaper than carrying a disruptive participant through a cohort

This guarantee is economically safe because marginal cost per student is near zero, and the program's core mechanics (peer review, live platform users, team selection) actually work *better* at larger cohort sizes.

### Revenue: placement referral fees

When a student is hired and we collect a referral fee from the employer, **10% of the fee is paid back to the student**.

Worked example:

| Item | Amount |
|------|--------|
| Student pays tuition | $10,000 |
| Student hired at | $200,000 salary |
| Program collects referral fee (~25%) | $50,000 |
| Student receives 10% kickback | $5,000 |
| **Student's net cost** | **$5,000** |
| **Program net revenue per placement** | **$55,000** |

The kickback aligns incentives: students benefit directly from strong placements, and program revenue scales with placement quality rather than enrollment volume.

### Future subsidies

Once revenue-positive, the program can subsidize tool subscriptions for some or all students, and potentially housing/food (as Gauntlet does) to widen the applicant pool.

---

## 5. Why Hult

- **Differentiated offering:** no business school currently offers a placement-guaranteed, GitHub-native, agent-first developer program. This sits naturally beside Hult's practical, employer-facing brand.
- **Hiring partner flywheel:** Phase 1 Project 3 creates a public showcase per cohort, built *by* the cohort, that gives hiring partners a recurring reason to engage with Hult.
- **Scales without faculty load:** assessment is peer- and market-driven; staff effort concentrates on placement, where the revenue is.
- **Ludwitt/Hult platform:** Phase 2 Project 1 seeds an ecosystem of student-built learning apps on the platform, compounding in value with every cohort.

---

## 6. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Students fail repeatedly, consuming cohort seats indefinitely | Near-zero marginal cost; buyout option; market eventually self-selects |
| A platform winner underperforms as operator | Governance allows removal/step-down; succession paths keep teams functional |
| Job guarantee creates liability if placements lag | Refund/buyout caps exposure at tuition; hiring partner pipeline must be built before cohort 1 graduates |
| Open source PRs are hard to land | Semester timeline gives room; agents materially lower the barrier; success metric can weight quality of attempts |
| Guarantee/refund terms conflict with university enrollment policy | Flagged for legal/registrar review before launch (see decisions below) |

---

## 7. Decisions requested from the EVP

1. **Approve the program concept** for development toward a first cohort: a one-semester program with unlimited repeat enrollment on a single fee.
2. **Institutional review:** sponsor a review of the pass/fail + money-back guarantee + repeat-enrollment model against Hult's enrollment, credit, and refund policies.
3. **Pricing:** confirm or adjust the $10,000 tuition working figure and refund/retake terms.
4. **Hiring partners:** designate an owner for building the hiring partner pipeline ahead of the first cohort's showcase.
5. **Calendar:** target start date for cohort 1.

Supporting detail is broken down into fine-grained working documents — see the [repository map](README.md) and the prioritized [work plan](WORKPLAN.md). Every open question lives as a checklist item in the file that owns it.
