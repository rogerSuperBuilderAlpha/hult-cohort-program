# Project 1: Project management platform (Weeks 2–4)

**Purpose:** Every student builds a production PM platform. The winner becomes the cohort's real project management system for the rest of the semester. This is the first run of [the loop](../the-loop.md) — it teaches the loop while producing the tool everything else runs on.

---

## Kickoff brief (delivered Tuesday week 2, 10:00)

> **Problem:** This cohort has 30 developers shipping six production projects in 16 weeks. Right now you're coordinating on Discord and spreadsheets — that's the bootstrap, not the solution. Your job: build the PM platform this cohort actually lives in for the next 14 weeks.
>
> **Users:** 30 students + 2 staff. Daily use. Real deadlines depend on your system working.
>
> **Ecosystem dynamics:** You're not building a todo app for yourself. You're building infrastructure others will file bugs against, submit PRs to, and blame when it goes down at 11pm before a deadline. Design for that.
>
> **Constraints:** Public repo in the cohort org. Production HTTPS URL. Must handle ≥ 30 accounts. Stack is your choice.
>
> **Differentiation:** What makes your platform better for *this* cohort than Linear, Notion, or GitHub Projects? If the answer is nothing, rethink.

---

## Week-by-week schedule

| Week | Days | Phase | Deliverable |
|------|------|-------|-------------|
| **2** | Sep 15–19 | Build | Repo created, core data model, auth working, 1 deploy |
| **3** | Sep 22–26 | Build | Projects + tasks + assignments + status; stable deploy |
| **4** | Sep 29 – Oct 3 | Review + vote | Deploy frozen Thu 17:00; reviews Fri 14:00; vote Fri 16:00 |
| **4→5** | Oct 4–6 | Cutover | Winner live by Mon Oct 6 kickoff |

See [operations/calendar.md](../../../operations/calendar.md) for exact dates.

---

## Post-cutover seeding (Mon Oct 6)

Within 24 hrs of going live, the PM platform must contain:

| Data | Source |
|------|--------|
| All 30 students as users | Operator imports from roster CSV (staff provides) |
| Project 2 (comms) as a project | Operator creates from brief |
| Project 1 review tasks (retroactive) | Optional — operator adds template |
| Week 5–16 calendar milestones | Operator creates from [calendar.md](../../../operations/calendar.md) |

Staff run first standup **on the PM platform** Tue Oct 7. Discord `#announcements` deprecated for schedule.

---

## Components

- [requirements.md](requirements.md) — mandatory functionality and eligibility
- [review-rubric.md](review-rubric.md) — project-specific rubric weights
- [operator-handbook.md](operator-handbook.md) — winner obligations through week 16

## Depends on

- [../the-loop.md](../the-loop.md)
- [../../onboarding/github-workflow.md](../../onboarding/github-workflow.md)
- [../../../assessment/peer-review-system.md](../../../assessment/peer-review-system.md)
