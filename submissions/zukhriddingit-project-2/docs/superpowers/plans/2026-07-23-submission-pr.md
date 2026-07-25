# Relay 65 Submission PR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a truthful, non-draft Project 2 submission pull request for Relay 65 and stop after it is opened.

**Architecture:** Relay remains a standalone static Firebase Hosting app. Its source is copied into the cohort repository beneath the participant’s Project 2 submission directory on a branch created from the prescribed Project 2 base branch. The PR body records only verified deployment, PM-platform, and QA facts.

**Tech Stack:** Git, GitHub pull requests, Firebase Hosting/Auth/Firestore, vanilla HTML/CSS/ES modules.

## Global Constraints

- Use the exact title `[Project 2] Submission — zukhriddingit`.
- Create `participants/summer26/phase-1-project-2/zukhriddingit` from `projects/summer26/phase-1-project-2`.
- Do not invent a production URL, PM platform name/URLs, credentials, metrics, or QA results.
- Keep Firebase on Spark; deploy only Firestore rules/indexes and Hosting.
- Never commit OAuth secrets, Admin credentials, local emulator dependencies, or Firebase configuration values beyond public browser identifiers.
- Open the PR after all required body sections are factual; do not merge it unless the user explicitly requests merging.

---

### Task 1: Collect and verify release facts

**Files:**
- Read: `config.js`, `PR_BODY.md`, `DEPLOYMENT.md`

- [ ] Obtain the deployed HTTPS URL from the completed Firebase Hosting deployment.
- [ ] Obtain the chosen PM platform name, platform base URL, and cohort board URL from the user or the platform operator.
- [ ] Record the product mode accurately as async-first communication with Firestore realtime delivery.
- [ ] Confirm GitHub OAuth, the first administrator bootstrap, and the final PM task-card link using the deployed app.

### Task 2: Prepare the cohort-repository branch

**Files:**
- Create: `submissions/zukhriddingit-project-2/` in a clean clone of `rogerSuperBuilderAlpha/hult-cohort-program`
- Copy from: the Relay 65 source directory

- [ ] Clone the cohort repository and switch to `projects/summer26/phase-1-project-2`.
- [ ] Create the exact participant branch from that base branch.
- [ ] Copy Relay source into `submissions/zukhriddingit-project-2/`, excluding `.git`, `node_modules`, `.firebase`, emulator logs, and local secret files.
- [ ] Review the staged diff so only the intended submission directory is added.

### Task 3: Validate and author the PR

**Files:**
- Modify: `submissions/zukhriddingit-project-2/PR_BODY.md` or submit the equivalent verified body through GitHub

- [ ] Run `npm test` in the copied Relay project and run the Firestore Emulator smoke suite.
- [ ] Build a PR body containing the required **Production URL**, **PM platform integration notes**, and **Agent usage** sections with verified facts.
- [ ] Commit the copied submission, push the participant branch, and open the PR against `projects/summer26/phase-1-project-2`.
- [ ] Confirm the created PR has the exact title and correct base/head branches, then stop without merging.
