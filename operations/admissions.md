# Admissions

**Purpose:** Define who gets into each cohort, how they're selected, and what they must understand before paying $10,000. Target cohort size: **30 students** (operating range 25–35).

More students per cohort improves peer review, voting, and team dynamics. Marginal cost is near zero. The buyout ([business/guarantee-refunds-buyouts.md](../business/guarantee-refunds-buyouts.md)) is the back-pressure for admission mistakes.

---

## Prerequisites

Agent-first development lowers the coding bar but does not eliminate it. Every student must arrive able to work in GitHub on day 1.

### Required at enrollment

| Requirement | How verified |
|-------------|--------------|
| GitHub account, ≥ 6 months old, with ≥ 5 commits on any repo | Link in application |
| English working proficiency (written) | Application essays + optional call |
| Laptop meeting [tooling spec](../curriculum/onboarding/tooling-setup.md): macOS or Linux preferred, 16GB RAM minimum | Self-attestation |
| Ability to pay $10,000 tuition + $400/month tooling for ≥ 4 months | Payment at week 1 start |
| Age ≥ 18 | Application |

### Recommended, not required

- Prior programming course, bootcamp, or CS coursework
- Familiarity with JavaScript or Python
- Prior Cursor or Claude Code use

### Not required

- CS degree
- Professional engineering experience
- Portfolio of shipped products

**Reasoning:** The program teaches GitHub-native collaboration and agent orchestration, not syntax from zero. But students who cannot read code, use git, or write a basic function will fail week 2. The admissions task filters for "can learn fast with agents," not "already senior."

---

## Selection process

**Recommendation:** **Light filter, high volume** — application + 48-hour agent-assisted take-home. No multi-round interviews for cohort 1.

### Funnel

| Stage | Action | Target conversion |
|-------|--------|-------------------|
| Application | Online form (15 min) | 100% of interested |
| Take-home | 48-hr GitHub task (see below) | 60% submit |
| Review | Staff review + auto-checks (48 hr turnaround) | 70% admitted |
| Confirm | Admitted students pay at **week 1 start** (not application) | 80% confirm |
| Week 1 | Attend onboarding; may withdraw for full refund by Friday | 95% continue |

**Target:** 40 applications → 24 take-home submits → 17 admitted → 14 confirm → **30 with two cohorts or overflow waitlist**

For cohort 1, run **one cohort of 25–30**; if demand exceeds 40 qualified applicants, open a waitlist and prioritize returners next term.

### Application form fields

Collected at **`/apply`** → Firestore `applications`. See [execution/marketing/FIREBASE.md](../execution/marketing/FIREBASE.md) and [execution/admissions/application-form.md](../execution/admissions/application-form.md).

1. GitHub profile URL
2. Why this program (200 words max)
3. What will you build for Project 1 PM platform? (100 words — tests intent, not correctness)
4. Timezone and preferred Hult campus (Boston / London / San Francisco / Dubai / online)
5. Hult student ID (if applicable)
6. How did you hear about us?

### Take-home: "Fix the repo" (48 hours)

**Task:** Clone a provided public repo with 3 intentional bugs and 1 missing feature. Use Cursor or Claude Code. Submit via PR.

**Auto-checks:**
- PR opened on time
- CI passes (or student documents why not)
- PR description follows template (summary, testing, agent usage notes)

**Human review (15 min/applicant):**
- Did they actually explore the repo or paste blindly?
- Is the PR reviewable by another developer?
- Did they document agent usage?

**Pass/fail:** Pass = PR is mergeable or close with minor fixes. Fail = no PR, plagiarized, or clearly unable to use git.

**Reasoning:** This is a miniature version of the program itself — explore repo, fix, submit PR, get reviewed. Fails cheaply before $10k.

---

## Cohort size bounds

| Bound | Size | Reason |
|-------|------|--------|
| **Minimum** | **20** | Below 20: peer review pool too thin (19 reviews still works but voting feels small); team picks of 10% get awkward (2 picks) |
| **Target** | **30** | 29 peer reviews × 3 projects; 3 winners + 9 picks = 12 leaders; matches proposal math |
| **Maximum** | **40** | Above 40: review window (3 days × 39 reviews) becomes brutal even with agents; operator triage load spikes |

If enrollment < 20 at week 1 start: **delay cohort 2 weeks** and continue recruiting, or merge with next campus cohort (online).

---

## Hult student vs. external applicants

| Aspect | Hult degree student | External applicant |
|--------|-------------------|-------------------|
| Application | Same form + Hult ID | Same form |
| Take-home | Same | Same |
| Tuition | $10,000 (⚠️ scholarship lane TBD) | $10,000 |
| Campus access | Existing ID | Issued continuing-ed ID |
| Visa | Existing status; confirm with ISS | Own visa responsibility unless Hult sponsors continuing-ed (⚠️ ISS) |
| Marketing | Internal Hult channels + email | Public web, social, founder network |

**Recommendation:** Single admissions process. No lowered bar for Hult students. Optional **5 seats reserved** for Hult students if external demand fills cohort first — prevents campus politics, preserves merit filter.

⚠️ **DECISION NEEDED (EVP):** Hult student scholarship or discount lane (e.g., $7,500 for enrolled Hult students).

---

## Recruitment channels (cohort 1)

| Channel | Owner | Launch | Goal |
|---------|-------|--------|------|
| Founder network (direct outreach) | Founder | June 2026 | 10 apps |
| Hult student email / bulletin | Hult marketing | July 2026 | 15 apps |
| Cursor Boston alumni list | Program director | June 2026 | 10 apps |
| LinkedIn / X (founder posts) | Founder | June–August 2026 | 10 apps |
| Dev Twitter / Hacker News "Show HN" | Founder | August 2026 | 5 apps |
| Hult corporate partner employees (referral) | Partnerships | July 2026 | 5 apps |

**Marketing headline:** *Pay once. Ship six production projects. Get a job offer — or come back free until you do.*

**Subhead:** *Every skill we teach is verifiable on GitHub. Every hiring partner can see your work before they interview you.*

### Landing page must disclose

- $10,000 tuition + ~$1,600/semester tooling ($400/month × 4)
- Pass/fail, not letter grades
- Public work: cohort platforms, apps, and GitHub activity are visible
- Week-1 full refund; after week 1, re-enrollment not cash refund
- Qualifying job offer definition ($80k+, full-time, software role)
- Unlimited repeat enrollment on single fee

---

## Pre-enrollment expectations document

Every admitted student must sign **Expectations Acknowledgment** before week 1:

1. **Workload:** 40–60 hrs/week; winners carry additional operator load in Phase 2
2. **Tooling cost:** $400/month, both tools required, no exceptions
3. **Public work:** Your code, reviews, and projects are public and used by hiring partners
4. **Peer review obligation:** ~29 written reviews per Phase 1 project; missing reviews = fail
5. **Pass/fail:** No grades; fail = free re-enrollment, not refund (after week 1)
6. **Cohort-owned tooling:** You will use platforms built by peers; you will also build platforms peers use
7. **Agent-first:** You are expected to direct AI agents daily; this is not optional
8. **Buyout exists:** Program may pay you $5,000 to exit if you're a poor fit

---

## Admissions calendar (cohort 1)

| Date | Milestone |
|------|-----------|
| June 15, 2026 | Applications open |
| August 15, 2026 | Application deadline |
| August 22, 2026 | Final take-home deadline |
| August 29, 2026 | Admissions decisions sent |
| September 1, 2026 | Admitted students confirm |
| September 8, 2026 | Week 1 start; tuition charged |
| September 12, 2026 | Week 1 refund deadline (Friday 5pm) |

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Hult student scholarship/discount | EVP |
| Continuing-ed visa sponsorship for externals | EVP + ISS |
| Payment timing (recommended: week 1 start) | EVP + Finance |

## Depends on

- [business/guarantee-refunds-buyouts.md](../business/guarantee-refunds-buyouts.md)
- [business/pricing.md](../business/pricing.md)
- [operations/calendar.md](calendar.md)
- [curriculum/onboarding/tooling-setup.md](../curriculum/onboarding/tooling-setup.md)
