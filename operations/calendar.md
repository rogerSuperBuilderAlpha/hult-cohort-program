# Summer Pilot 2026 calendar

**Purpose:** Map the 6-week pilot onto fixed dates with weekly rhythm, hard deadlines, and buffer policy. Program directors run cohort 1 from this document.

**Cohort 1 start:** **Monday, July 13, 2026**<br>
**Pilot end:** **Sunday, August 23, 2026** (week 6 submission close + end-of-pilot showcase)

> ⚠️ **Cadence redesign needed:** Start moved from Thu Jul 9 → **Mon Jul 13** (+4 days). The week-by-week dates and the Thursday-kickoff / Wednesday-submission / Thursday-review rhythm below still reflect the old Thursday anchor. A straight +4-day shift lands build days on the weekend and submissions on Sunday, so program directors should choose the new Monday-anchored weekly cadence rather than mechanically shift. The applicant-facing site + emails and the app's schedule engine (`program-schedule.ts`, `program.ts`) are already updated to the Jul 13 anchor.

Firestore cohort id remains `fall26`; public name is **Summer Pilot 2026**.

---

## Term mapping

Eight tracked deliverables across six weeks. Phase 1 contest weeks (2–4) compress build and review into a single calendar week; week 6 carries the learning app, venture, and open-source pass gates together.

| Week | Dates (2026) | Phase | Unit | Hard deadline |
|------|--------------|-------|------|---------------|
| 1 | Jul 9–15 | Onboarding | Agent setup, GitHub workflow, tooling | Wed Jul 15, 17:00 ET: refund deadline; roster locked |
| 2 | Jul 16–22 | Phase 1 | PM platform (build + review + vote) | Wed 17:00: submission PR merged; Thu 14:00 reviews; Thu 16:00 votes |
| 3 | Jul 23–29 | Phase 1 | Comms platform (build + review + vote) | Same rhythm as week 2 |
| 4 | Jul 30 – Aug 5 | Phase 1 | Showcase platform (build + review + vote) | Same rhythm as week 2 |
| 5 | Aug 6–12 | Phase 1 | Ecosystem unification | Wed Aug 12, 17:00: unified demo |
| 6 | Aug 13–19 | Phase 2 | Learning app, venture, open source + finale | Wed Aug 19, 17:00: user snapshot, venture proof, OSS merge; hiring partner showcase |

Open source work may begin earlier, but the pass gate is one merged upstream PR by pilot end.

Canonical schedule and ISO timestamps: [execution/marketing/site/content/program.ts](../execution/marketing/site/content/program.ts).

---

## Weekly rhythm

All times in **Eastern Time** for the Summer Pilot. Online students join the Boston schedule.

| Day | Event | Duration | Attendance |
|-----|-------|----------|------------|
| **Thursday 10:00** | Kickoff / lecture (when applicable) | 60 min | Required |
| **Thursday 11:00** | Office hours (program staff) | 60 min | Optional |
| **Monday–Tuesday** | Async build days | — | — |
| **Wednesday 10:00** | Demo prep / peer Q&A | 45 min | Required during build weeks |
| **Wednesday 17:00** | Submission PR due (Phase 1 contest weeks) | — | Required |
| **Thursday 14:00** | Written reviews due (Phase 1) | — | Required during review weeks |
| **Thursday 16:00** | Private vote closes (Phase 1) | — | Required during vote weeks |
| **Thursday 16:30** | Week retro (async post in cohort comms) | 15 min | Required |

**Reasoning:** Thursday kickoffs match the July 9 start; Wednesday submission and Thursday review/vote create a weekly cadence. Phase 1 is intentionally compressed — one week per platform.

### Phase 1 review week micro-schedule (example: week 2, PM platform)

| Day | Action |
|-----|--------|
| Wed Jul 22, 17:00 | Submission PRs due; review window opens |
| Wed Jul 22 | Deploy URLs published on platform |
| Thu Jul 23, 14:00 | All peer written reviews submitted |
| Thu Jul 23, 16:00 | Private votes submitted |
| Fri Jul 24, 10:00 | Winner announced; cutover begins |

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
| Private votes | ✅ | — |
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
4. **Winner can't cutover before next kickoff:** Interim operator = runner-up by vote count; original winner has until Thursday to finish or loses operator role.

---

## Cohort 1 milestone checklist (program director)

| Date | Check |
|------|-------|
| Jun 15 | Applications open |
| Jul 2 | Application deadline |
| Jul 12 | Admissions complete; cohort ≥ 20 confirmed |
| Jul 13 | Week 1 start; tuition charged |
| Jul 19 | Refund window closes; final roster locked |
| Jul 28 | PM platform live (week 2 winner) |
| Aug 4 | Comms platform live |
| Aug 11 | Showcase platform live |
| Aug 16 | Unified ecosystem demo |
| Aug 23 | Final metrics freeze; learning app, venture, OSS gates close; hiring partner showcase |
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
