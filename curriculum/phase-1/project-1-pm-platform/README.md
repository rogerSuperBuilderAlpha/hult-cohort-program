# Project 1: Project management platform (Week 2)

**Purpose:** Every student builds a production PM platform in one week. The winner becomes the cohort's real project management system through pilot end. This is the first run of [the loop](../the-loop.md) — it teaches the loop while producing the tool everything else runs on.

---

## Kickoff brief (delivered Thursday week 2, 10:00)

> **Problem:** This cohort has 30 developers shipping eight tracked deliverables in six weeks. Right now you're coordinating on Discord and spreadsheets — that's the bootstrap, not the solution. Your job: build the PM platform this cohort actually lives in for the rest of the pilot.
>
> **Users:** 30 students + 2 staff. Daily use. Real deadlines depend on your system working.
>
> **Ecosystem dynamics:** You're not building a todo app for yourself. You're building infrastructure others will file bugs against, submit PRs to, and blame when it goes down before a deadline. Design for that.
>
> **Constraints:** Public repo in the cohort org. Production HTTPS URL. Multi-user auth sized for the enrolled cohort (capacity — merge when the PR template is complete; you do not need real signups first). Stack is your choice.
>
> **Differentiation:** What makes your platform better for *this* cohort than Linear, Notion, or GitHub Projects? If the answer is nothing, rethink.

---

## Week schedule (compressed)

| Day | Phase | Deliverable |
|-----|-------|-------------|
| Mon | Kickoff | Repo created, data model started |
| Tue–Thu | Build | Projects + tasks + assignments; stable deploy |
| Fri 17:00 ET | Present | Demo the build and make the case for it |
| Sun 17:00 ET | Submit | Submission PR **merged**; review window opens |
| Mon 17:00 ET | Review | Written reviews due; public `Vote: up` closes with them |
| Mon 18:00 ET | Winner | Announced live; cutover before next kickoff |

See [operations/calendar.md](../../../operations/calendar.md) and [content/program.ts](../../../execution/marketing/site/content/program.ts) for exact dates.

---

## Post-cutover seeding (Monday after week 2)

Within 24 hrs of going live, the PM platform must contain:

| Data | Source |
|------|--------|
| All enrolled students as users | Operator imports from roster CSV (staff provides) |
| Project 2 (comms) as a project | Operator creates from brief |
| Weeks 3–8 calendar milestones | Operator creates from [calendar.md](../../../operations/calendar.md) |

Staff run first standup **on the PM platform** Tuesday week 3. Discord `#announcements` deprecated for schedule.

---

## Components

- [requirements.md](requirements.md) — mandatory functionality and eligibility
- [review-rubric.md](review-rubric.md) — project-specific rubric weights
- [operator-handbook.md](operator-handbook.md) — winner obligations through week 8

## Depends on

- [../the-loop.md](../the-loop.md)
- [../../onboarding/github-workflow.md](../../onboarding/github-workflow.md)
- [../../../assessment/peer-review-system.md](../../../assessment/peer-review-system.md)
