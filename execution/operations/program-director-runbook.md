# Program director runbook — Fall 2026

One-page-per-week checklist. Full detail in linked docs. Timezone: **Boston (ET)**.

---

## Before start (May–Sep 7)

See [cohort-1-launch.md](../checklists/cohort-1-launch.md).

- [ ] EVP sign-offs tracked in [WORKPLAN.md](../../WORKPLAN.md)
- [ ] Roster ≥ 20 confirmed ([admissions/application-form.md](../admissions/application-form.md))
- [ ] GitHub org ready ([github-org-setup.md](github-org-setup.md))
- [ ] Discord bootstrap ([discord-bootstrap.md](discord-bootstrap.md))
- [ ] Partner pipeline ≥ 3 signed ([hiring-partners.md](../../partnerships/hiring-partners.md))

---

## Week 1 · Sep 8–12 · Onboarding

| Day | You do |
|-----|--------|
| Mon | Charge tuition; send org invites; kickoff 10:00 ([agent-setup.md](../../curriculum/onboarding/agent-setup.md)) |
| Tue | Agent setup workshop |
| Wed | Agent relay exercise |
| Thu | GitHub workflow + repo archaeology |
| Fri 14:00 | Verify 100% tooling in Discord |
| Fri 17:00 | **Refund window closes** — lock roster |

**Deliverable:** Every student deploy-ready for week 2.

---

## Week 2 · Sep 15–19 · PM kickoff

| Day | You do |
|-----|--------|
| Tue 10:00 | Project 1 kickoff brief ([project-1 README](../../curriculum/phase-1/project-1-pm-platform/README.md)) |
| Thu | Demo prep clinic |
| Fri | Retro async post |

Publish org template repo if not done.

---

## Week 3 · Sep 22–26 · PM build

- Office hours Tue 11:00
- No deadlines — watch for students who haven't deployed by Thu

---

## Week 4 · Sep 29 – Oct 3 · PM review + vote

| Day | You do |
|-----|--------|
| Mon | Open review window; publish repo list in Discord `#reviews` |
| Wed 14:00 | Checkpoint: everyone ≥ 10/29 reviews |
| Fri 14:00 | **29/29 reviews due** |
| Fri 16:00 | **Vote closes** — run [vote-tally.js](../cohort-scripts/vote-tally.js) |
| Fri 17:00 | Tally ranked-choice |

**Mon Oct 6 10:00:** Announce winner; cutover begins ([the-loop.md](../../curriculum/phase-1/the-loop.md)).

Run [review-assignments.js](../cohort-scripts/review-assignments.js) with real roster before Mon.

---

## Week 5 · Oct 6–10 · Comms kickoff; PM live

- Tue: Project 2 kickoff
- Confirm PM platform seeded with calendar + Project 2
- Staff standup on PM platform (not Discord)

---

## Week 6 · Oct 13–17 · Comms review (compressed)

| Day | You do |
|-----|--------|
| Mon | Review window opens |
| Tue 14:00 | **Reviews due** |
| Tue 16:00 | **Vote closes** |
| Wed 10:00 | Winner announced |
| Fri | Comms live; **archive Discord write access** |

---

## Week 7 · Oct 20–24 · Showcase kickoff; comms live

- Tue: Project 3 kickoff + unification sync scheduled
- Remind partners: showcase read-only access live ([hiring-partners.md](../../partnerships/hiring-partners.md))

---

## Week 8 · Oct 27 – Nov 7 · Showcase + unification + draft

| Day | You do |
|-----|--------|
| Mon–Tue | Showcase review/vote (same as week 4 schedule) |
| Wed Nov 3 | Showcase winner announced |
| Thu–Fri | Unification syncs daily |
| **Fri Nov 7 17:00** | **Unified ecosystem demo** — run acceptance script ([ecosystem-unification.md](../../curriculum/phase-1/ecosystem-unification.md)) |
| Fri 18:00 | **Team draft ceremony** ([team-formation.md](../../governance/team-formation.md)) |

Confirm Ludwitt/Hult API staging ready for week 9.

---

## Week 9 · Nov 10–14 · Learning app + OS start

- Tue: Phase 2 Project 1 kickoff
- Students register apps on platform
- OS: repos chosen by Fri

---

## Week 10 · Nov 17–21 · Learning app promote

- Monitor platform metrics
- **Fri Nov 21:** Snapshot #1 export ([ludwitt-hult-api](../ludwitt-hult-api/))

---

## Week 11 · Nov 24–28 · Thanksgiving

- **No live sessions**
- Email: async-only week reminder
- Deadlines unchanged

---

## Week 12 · Dec 1–5 · Venture research

- Tue: Venture kickoff
- Thu: Optional peer business plan swap

---

## Week 13–14 · Dec 8–12 · Venture ship

- **Fri Dec 12:** Venture snapshot + investor decks due
- Verify INVESTOR_LOG entries with placement lead

---

## Week 15 · Dec 15–17 · Metrics freeze

- **Wed Dec 17:** Run pass/fail script ([pass-fail.md](../../assessment/pass-fail.md))
- Job-offer readiness review ([job-offer-readiness.md](../../assessment/job-offer-readiness.md))
- Featured students list to placement lead

---

## Week 16 · Dec 15–19 · Showcase

| When | You do |
|------|--------|
| Fri 10:00–16:00 | Host showcase ([showcase-event.md](../../partnerships/showcase-event.md)) |
| Fri 18:00 | Private pass/fail emails ([emails.md](../templates/emails.md)) |
| Sat Dec 20 | Placement window opens |

---

## Every review week (reference)

1. Generate assignments: `node cohort-scripts/review-assignments.js roster.csv`
2. Publish ballot in Firestore + link `/vote/{project}` (eligible merged PRs)
3. Fri 14:00 reviews / Fri 16:00 votes
4. Mon announce + cutover

---

## Escalation quick ref

| Issue | Doc |
|-------|-----|
| Operator SLA miss | [removal-succession.md](../../governance/removal-succession.md) |
| Buyout | [guarantee-refunds-buyouts.md](../../business/guarantee-refunds-buyouts.md) |
| Partner intro | [placement-referrals.md](../../business/placement-referrals.md) |
