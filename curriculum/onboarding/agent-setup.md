# Agent setup: research, development, QA

**Purpose:** Week 1 curriculum teaching students to set up and direct three agent roles matched to the task. This is a headline program skill, not an advanced elective.

---

## The three roles

| Role | When to use | Primary tool | Output |
|------|-------------|--------------|--------|
| **Research** | Unfamiliar domain, repo archaeology, market/competitive work | Claude Code (long context) | Notes doc, issue comments, architecture sketch |
| **Development** | Implementation, refactors, feature builds | Cursor Agent | Code, tests, PRs |
| **QA** | Test plans, edge cases, regression checks, review prep | Either; often Claude Code for adversarial testing | Test cases, bug reports, review checklist |

Students must be fluent in **both** Cursor and Claude Code and choose by task, not habit.

---

## Prescriptive vs exploratory

**Recommendation:** **Week 1 is prescriptive (hand them configs). Week 2 onward is exploratory (they derive their own).**

Reasoning: agents on day 1 without scaffolding produce garbage PRs. One week of templates builds muscle memory for role-switching; then students customize.

---

## Starter configurations (week 1 handout)

### Research agent — repo archaeology

**Claude Code prompt (save as `docs/agents/research.md` in every build repo):**

```
You are a research agent. Do not write production code.
Goal: map this codebase for a new contributor in 30 minutes.
Output:
1. Directory map (what lives where)
2. Entry points (how the app starts)
3. Data flow (user action → persistence)
4. Top 5 risk areas for a new feature
5. Recommended first PR scope (small, mergeable)
Cite file paths for every claim. Read code; do not guess.
```

### Development agent — feature implementation

**Cursor rule (`.cursor/rules/dev.mdc`):**

```
You are a development agent.
- Work on the current branch only
- Small commits; one concern per commit
- Write tests for new behavior
- Do not refactor unrelated code
- Before finishing: run linter and tests; fix failures
- PR description must include: summary, test plan, agent tools used
```

### QA agent — pre-review pass

**Claude Code prompt:**

```
You are a QA agent. Assume the developer missed edge cases.
Given this PR diff and the app's stated requirements:
1. List 10 test scenarios (happy path + edge + adversarial)
2. Run through each scenario mentally against the code; mark PASS/FAIL/UNKNOWN
3. File findings as numbered review comments ready to paste into GitHub
Be harsh. Prefer false positives over false negatives.
```

---

## Week 1 exercises (Tuesday–Thursday)

### Exercise 1: Role identification (Tuesday, 30 min)

Given 5 task cards, student writes which agent role they deploy first and which tool:

| Task | Correct first role |
|------|-------------------|
| "Find where auth is implemented in this 40k-line repo" | Research |
| "Add a dark mode toggle" | Development |
| "Your PM platform must handle 30 concurrent users" | QA (load/test planning) before dev |
| "Is this startup market big enough for a venture project?" | Research |
| "Review peer's PR before Friday deadline" | QA |

### Exercise 2: Agent relay (Wednesday, 2 hrs)

1. Research agent maps the admissions take-home repo
2. Development agent fixes one bug from the map
3. QA agent reviews the PR before human submits

Deliverable: PR with section **"Agent relay log"** listing which agent did what.

### Exercise 3: Custom config (Thursday, 1 hr)

Student modifies one starter config for their preferred stack. Submit PR to personal `hult-cohort-{name}/agent-configs` repo.

---

## Shared cohort conventions

Every **build repo** in Phase 1 must include:

```
docs/agents/
  research.md      (starter or customized)
  dev.md           (or .cursor/rules/)
  qa.md
AGENTS.md          (which role for which task on THIS project)
```

The cohort GitHub org ships a **template repo** `cohort-project-template` with these files pre-populated. Students fork or use as template for each build.

`AGENTS.md` is reviewed in peer review rubric (lightweight — did they document their agent workflow?).

---

## Assessment

Agent orchestration is **not separately graded**. It shows up in:

- **PR quality** (dev agent discipline → mergeable PRs)
- **Review quality** (QA agent → sharper peer reviews)
- **Build speed** (research agent → faster repo comprehension)

Optional **distinction note** on showcase profile if a student publishes an exceptional `AGENTS.md` / config repo — placement lead discretion, not pass/fail.

---

## Open decisions

None — operational choices locked for cohort 1.

## Depends on

- [tooling-setup.md](tooling-setup.md)
- [github-workflow.md](github-workflow.md)
