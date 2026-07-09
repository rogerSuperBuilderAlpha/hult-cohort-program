# Agent setup — @jayyyw34 (operator-approved Cursor workflow)

Summer Pilot 2026 · Week 1 agent configuration.

## Tooling approval

| Item | Status | Notes |
|------|--------|-------|
| Cursor Pro | ✅ Active | $20/month plan |
| Cursor model | ✅ Active | Composer 2.5 Fast |
| Separate Claude Code (Max) | ⏭️ Waived | Operator approval: Roger confirmed via WhatsApp that this Cursor setup is sufficient and should not hit a usage cap |

This participant uses **Cursor Agent for all three roles** (research, development, QA) unless a task explicitly benefits from a different tool later in the program.

## Role mapping (Cursor-only)

| Role | Tool | How to invoke |
|------|------|----------------|
| **Research** | Cursor Agent | Ask mode or agent with read-only exploration; cite file paths; no production edits |
| **Development** | Cursor Agent | Agent mode; branch-scoped edits, tests, commits, PRs |
| **QA** | Cursor Agent | Agent or review prompt on PR diff; adversarial test scenarios |

## Starter prompts (from [agent-setup.md](../curriculum/onboarding/agent-setup.md))

### Research agent

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

### Development agent

Use `.cursor/rules/` conventions from agent-setup.md (dev agent discipline: branch scope, tests, PR template).

### QA agent

```
You are a QA agent. Assume the developer missed edge cases.
Given this PR diff and the app's stated requirements:
1. List 10 test scenarios (happy path + edge + adversarial)
2. Run through each scenario mentally against the code; mark PASS/FAIL/UNKNOWN
3. File findings as numbered review comments ready to paste into GitHub
Be harsh. Prefer false positives over false negatives.
```

## Verification (completed)

End-to-end Cursor agent session used for onboarding:

1. **Research** — Explored cohort repo branches, onboarding docs, submission format.
2. **Development** — Created checklist, Vercel smoke app, commits on `participants/summer26/onboarding/jayyyw34`.
3. **QA** — Verified deploy URL (HTTP 200), PR body sections, fork push, and honest pending-item tracking before updates.

**Verified:** Cursor Pro + Composer 2.5 Fast active in this environment; no separate Claude Code subscription required per operator.
