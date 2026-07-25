# Summer Pilot 2026 calendar

**Purpose:** Map the 6-week pilot onto fixed dates with weekly rhythm, hard deadlines, and buffer policy. Program directors run cohort 1 from this document.

**Cohort 1 start:** **Monday, July 13, 2026**<br>
**Pilot end:** **Sunday, August 23, 2026** (week 6 submission close + end-of-pilot showcase)

The pilot is **Monday-anchored**: each contest week opens Monday, presents Friday 17:00 ET, merges Sunday 17:00 ET, and closes reviews Monday 17:00 ET. Dates below are derived from [content/program.ts](../execution/marketing/site/content/program.ts), which stays canonical — if the two disagree, `program.ts` wins.

Firestore cohort id is `summer26`; public name is **Summer Pilot 2026**.

---

## Term mapping

Eight tracked deliverables across six weeks. Phase 1 contest weeks (2–4) compress build and review into a single calendar week; week 6 carries the learning app, venture, and open-source pass gates together.

| Week | Dates (2026) | Phase | Unit | Hard deadline |
|------|--------------|-------|------|---------------|
| 1 | Jul 13–20 | Phase 1 | PM platform (build + review + vote) | Sun Jul 19, 17:00 ET: PR merged · Mon Jul 20, 17:00 ET: reviews + upvotes |
| 2 | Jul 20–27 | Phase 1 | Comms platform (build + review + vote) | Sun Jul 26, 17:00 ET: PR merged · Mon Jul 27, 17:00 ET: reviews + upvotes |
| 3 | Jul 27 – Aug 3 | Phase 1 | Vibe marketing platform (build + review + vote) | Sun Aug 2, 17:00 ET: PR merged · Mon Aug 3, 17:00 ET: reviews + upvotes |
| 4 | Aug 3–9 | Phase 2 | Ludwitt learning app | Sun Aug 9, 17:00 ET: proof PR merged with metrics snapshot |
| 5 | Aug 10–16 | Phase 2 | Venture | Sun Aug 16, 17:00 ET: venture proof merged |
| 6 | Aug 17–23 | Phase 2 | Open source swarm + finale | Sun Aug 23, 17:00 ET: upstream PR merged; hiring partner showcase |

Open source work may begin earlier, but the pass gate is one merged upstream PR by pilot end.

Canonical schedule and ISO timestamps: [execution/marketing/site/content/program.ts](../execution/marketing/site/content/program.ts).

---

## Weekly rhythm

All times in **Eastern Time** for the Summer Pilot. Online students join the Boston schedule.

| Day | Event | Duration | Attendance |
|-----|-------|----------|------------|
| **Monday** | Kickoff / lecture; new project brief opens | 60 min | Required |
| **Monday 18:00** | Live session — prior week's winner announced, next brief opened | 60 min | Required |
| **Tuesday–Thursday** | Async build days | — | — |
| **Friday 17:00** | Present — demo your build and make the case for it | — | Required during contest weeks |
| **Sunday 17:00** | Submission PR **merged**; review window opens | — | Required |
| **Monday 17:00** | Written reviews due; optional public `Vote: up` closes with them | — | Required during review weeks |
| **Monday 17:30** | Week retro (async post in cohort comms) | 15 min | Required |

**Reasoning:** A Monday anchor matches the Jul 13 start. Building runs Monday to Friday, the weekend absorbs polish and the merge, and the 24-hour review window closes an hour before the Monday session where the winner is announced. Phase 1 is intentionally compressed — one week per platform.

### Phase 1 review week micro-schedule (example: week 2, comms platform)

| Day | Action |
|-----|--------|
| Fri Jul 24, 17:00 | Builders present; reviewers may start reading early |
| Sun Jul 26, 17:00 | Submission PRs merged; review window opens; deploy URLs published |
| Mon Jul 27, 17:00 | All peer written reviews submitted; optional `Vote: up` finalized in each issue |
| Mon Jul 27, 18:00 | Winner announced live; cutover begins |

---

## Holidays and breaks

The Summer Pilot runs contiguously — no Thanksgiving or winter-break pauses. Individual religious observances: program director may grant ±48 hr on non-contest checkpoints only.

| Concern | Handling |
|---------|----------|
| US Independence Day (Jul 4, before start) | No impact — pilot starts Jul 13 |
| UK/EU local holidays | Online/async substitution; contest-week deadlines hold |
| Religious observances | Individual accommodations via program director |

---

## Buffer policy

| Item | Hard (no extension) | Soft (program director may grant +48 hrs) |
|------|---------------------|---------------------------------------------|
| Review submissions | ✅ | — |
| Optional upvotes (`Vote: up`) | ✅ | — |
| Build deploy URL for review | ✅ | — |
| Winner cutover complete | ✅ | — |
| Ecosystem unification demo | ✅ | — |
| Learning app user snapshot | ✅ | — |
| Venture deck quality | — | ✅ (draft acceptable; final by week 6 close) |
| Open source first PR opened | — | ✅ |
| Showcase RSVP prep | — | ✅ |

**Reasoning:** Phase 1 hard deadlines train the core skill — others depend on your reviews and votes. Phase 2 external deadlines are softer because the market does not extend deadlines, but agent leverage makes +48 hr recovery reasonable once per project.

### If a project overruns

1. **Build not deployed by review deadline:** Build is ineligible for votes; student may still review others (counts toward pass); may re-enroll next cohort to compete.
2. **Reviews incomplete:** Automatic fail for that project unit; may re-enroll.
3. **Vote tie:** Most 👍 wins; staff breaks ties using written-review quality (see [governance/winner-selection.md](../governance/winner-selection.md)).
4. **Winner can't cutover before next kickoff:** Interim operator = runner-up by vote count; original winner has until the following Monday to finish or loses operator role.

---

## Cohort 1 milestone checklist (program director)

| Date | Check |
|------|-------|
| Jun 15 | Applications open |
| Jul 2 | Application deadline |
| Jul 12 | Admissions complete; cohort ≥ 20 confirmed |
| Jul 13 | Week 1 start; tuition charged |
| Jul 19 | Refund window closes; final roster locked |
| Jul 20 | PM platform winner announced (week 1); cutover begins |
| Jul 27 | Comms platform winner announced (week 2); cutover begins |
| Aug 3 | Vibe marketing winner announced (week 3); cutover begins |
| Aug 9 | Learning app user snapshot due |
| Aug 16 | Venture proof due |
| Aug 23 | Final metrics freeze; OSS gate closes; hiring partner showcase |
| Aug 24 | Pass/fail computed; placement window opens |

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
