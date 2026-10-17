# Fall 2026 calendar

**Purpose:** Map the 6-week cohort onto fixed dates with weekly rhythm, hard deadlines, and buffer policy. Program directors run this cohort from this document.

**Cohort start:** **Thursday, October 15, 2026**, 09:00 Eastern Time<br>
**Pilot end:** **Sunday, November 29, 2026** (week 6 submission close). Hiring partner showcase **December 2, 2026**.

Week 1 is a **10-day first contest** (Thursday open through the following Sunday) so kickoff is not a four-day sprint. Weeks 2–6 are Monday–Sunday. Vote weeks merge by Sunday 17:00 ET; the review window runs through Monday 17:00 ET. Dates below are derived from [content/program.ts](../execution/marketing/site/content/program.ts), which stays canonical — if the two disagree, `program.ts` wins.

Firestore cohort id is `fall26`; public name is **Fall 2026**.

---

## Term mapping

Six sequential projects. Phase 1 contest weeks each include build and review. Phase 2 is one focus per week.

| Week | Dates (2026) | Phase | Unit | Hard deadline |
|------|--------------|-------|------|---------------|
| 1 | Oct 15–26 | Phase 1 | PM platform (build + review) | Sun Oct 25, 17:00 ET: PR merged · Mon Oct 26, 17:00 ET: reviews + optional upvotes |
| 2 | Oct 26 – Nov 2 | Phase 1 | Comms platform (build + review) | Sun Nov 1, 17:00 ET: PR merged · Mon Nov 2, 17:00 ET: reviews + optional upvotes |
| 3 | Nov 2–9 | Phase 1 | Vibe marketing platform (build + review) | Sun Nov 8, 17:00 ET: PR merged · Mon Nov 9, 17:00 ET: reviews + optional upvotes |
| 4 | Nov 9–15 | Phase 2 | Ludwitt learning app | Sun Nov 15, 17:00 ET: proof PR merged. Registered app, working sign-in or launch, events landing. No user-count. |
| 5 | Nov 16–22 | Phase 2 | Venture | Sun Nov 22, 17:00 ET: venture proof merged (≥25 users, ≥1 investor touch) |
| 6 | Nov 23–29 | Phase 2 | Open source swarm | Sun Nov 29, 17:00 ET: upstream PR merged |

Open source work may begin earlier, but the pass gate is one merged upstream PR by pilot end. US Thanksgiving (Thu Nov 26) falls inside week 6; the Sunday deadline holds.

Canonical schedule and ISO timestamps: [execution/marketing/site/content/program.ts](../execution/marketing/site/content/program.ts).

---

## Weekly rhythm

All times in **Eastern Time**. Online students join the Boston schedule. Clocks change Sunday, November 1, 2026; deadlines stay 17:00 local Eastern.

| Day | Event | Duration | Attendance |
|-----|-------|----------|------------|
| **Thursday Oct 15, 09:00** | First session; Week 1 brief opens | 60 min | Required |
| **Monday** (weeks 2–6) | Kickoff; new project brief opens | 60 min | Required |
| **Monday 18:00** | Live session — prior week's winner announced when a review week just closed | 60 min | Required |
| **Tuesday–Thursday** | Async build days | — | — |
| **Friday 17:00** | Present — demo your build and make the case for it | — | Required during contest weeks |
| **Sunday 17:00** | Submission PR **merged**; review window opens on vote weeks | — | Required |
| **Monday 17:00** | Written reviews due; optional public `Vote: up` closes with them | — | Required during review weeks |
| **Monday 17:30** | Week retro (async post in cohort comms) | 15 min | Required |

Week 2 opens Monday Oct 26 at 09:00 ET while Week 1 reviews are still due at 17:00 ET the same day.

### Phase 1 review week micro-schedule (example: week 2, comms platform)

| Day | Action |
|-----|--------|
| Fri Oct 30, 17:00 | Builders present; reviewers may start reading early |
| Sun Nov 1, 17:00 | Submission PRs merged; review window opens; deploy URLs published |
| Mon Nov 2, 17:00 | All peer written reviews submitted; optional `Vote: up` finalized in each issue |
| Mon Nov 2, 18:00 | Winner announced live; cutover begins |

---

## Holidays and breaks

The cohort runs contiguously. Individual religious observances: program director may grant ±48 hr on non-contest checkpoints only.

| Concern | Handling |
|---------|----------|
| US Thanksgiving (Thu Nov 26, during week 6) | Deadline holds — upstream merge still due Sun Nov 29, 17:00 ET |
| UK/EU local holidays | Online/async substitution; contest-week deadlines hold |
| Religious observances | Individual accommodations via program director |

---

## Buffer policy

| Item | Hard (no extension) | Soft (program director may grant +48 hrs) |
|------|---------------------|---------------------------------------------|
| Review submissions | Yes | — |
| Optional upvotes (`Vote: up`) | Yes | — |
| Build deploy URL for review | Yes | — |
| Winner cutover complete | Yes | — |
| Learning app integration proof | Yes | — |
| Venture deck quality | — | Yes (draft acceptable; final by week 5 close) |
| Open source first PR opened | — | Yes |
| Showcase RSVP prep | — | Yes |

**Reasoning:** Phase 1 hard deadlines train the core skill — others depend on your reviews. Phase 2 external deadlines are softer because the market does not extend deadlines, but agent leverage makes +48 hr recovery reasonable once per project.

### If a project overruns

1. **Build not deployed by review deadline:** Build is ineligible for votes; student may still review others (counts toward pass); may re-enroll next cohort to compete.
2. **Reviews incomplete:** Automatic fail for that project unit; may re-enroll.
3. **Vote tie:** Most `Vote: up` wins; staff breaks remaining ties by earliest merge, then handle (see [governance/winner-selection.md](../governance/winner-selection.md)).
4. **Winner can't cutover before next kickoff:** Interim operator = runner-up by vote count; original winner has until the following Monday to finish or loses operator role.

---

## Milestone checklist (program director)

| Date | Check |
|------|-------|
| Sep 10 | Applications open |
| Oct 14 | Application deadline |
| Oct 15, 09:00 ET | Week 1 start; first session |
| Oct 25 | Project 1 PRs merged |
| Oct 26 | PM platform reviews close; winner announced; Week 2 opens |
| Nov 1 | Project 2 PRs merged |
| Nov 2 | Comms reviews close; winner announced; Week 3 opens |
| Nov 8 | Project 3 PRs merged |
| Nov 9 | Showcase reviews close; winner announced; Week 4 opens |
| Nov 15 | Learning app proof due (no user-count) |
| Nov 22 | Venture proof due |
| Nov 26 | Thanksgiving — week 6 deadline unchanged |
| Nov 29 | OSS gate closes |
| Nov 30 | Pass/fail email |
| Dec 2 | Hiring partner showcase |

---

## Open decisions

| Item | Who decides |
|------|-------------|
| End-of-pilot showcase format (in-person vs hybrid) | EVP + Campus Operations |
| Campus timezone anchor for online students | Program director |

## Depends on

- [institutional/policy-review.md](../institutional/policy-review.md)
- [operations/admissions.md](admissions.md)
- [partnerships/showcase-event.md](../partnerships/showcase-event.md)
- [partnerships/hiring-partners.md](../partnerships/hiring-partners.md)
