# Submission Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a truthful, production-ready Relay 65 submission with reproducible QA evidence and a pull request on the required cohort branch.

**Architecture:** Relay remains a Firebase Spark-core application: GitHub Authentication, Firestore, and Hosting. No Storage, Functions, billing upgrade, or webhook deployment is permitted. Submission evidence combines dependency-free root tests, Firestore Emulator rule tests, live production verification, and the completed PR body.

**Tech Stack:** Vanilla ES modules, Firebase Authentication, Cloud Firestore, Firebase Hosting, Firebase CLI, Node.js 22+, Java 21+, Git.

## Global Constraints

- Keep Firebase on the no-cost Spark plan.
- Deploy only `firestore:rules`, `firestore:indexes`, and `hosting`.
- Preserve global GitHub entry through `settings/workspace.accessMode: "open"`.
- Preserve private-channel and participant-only DM authorization.
- Do not commit OAuth secrets, Admin SDK credentials, webhook secrets, or private keys.
- Do not invent the winning PM platform name, base URL, or board URL.
- Keep the root `npm test` dependency-free.

---

### Task 1: Install the free Java runtime and certify Rules behavior

**Files:**
- Verify: `emulator/channel-rules-smoke.mjs`
- Verify: `emulator/README.md`
- Update evidence only after a successful run: `QA_REPORT.md`, `PR_BODY.md`, `SUBMISSION_CHECKLIST.md`

**Interfaces:**
- Consumes: Homebrew Cask `temurin@21`; `emulator/package.json` script `test:emulator`.
- Produces: successful `npm run test:emulator` output for public/member channel queries, open-entry gating, private child-message denial, privileged-third-party DM denial, and attachment denial.

- [x] **Step 1: Install Java 21**

```bash
brew install --cask temurin@21
java -version
```

Expected: `java -version` reports a Java 21 runtime.

- [x] **Step 2: Run the Rules smoke suite**

```bash
cd /Users/zukhriddin/Documents/HackathonProjects/relay65/emulator
npm run test:emulator
```

Expected: all `channel-rules-smoke.mjs` tests pass and the disposable Emulator shuts down cleanly.

- [x] **Step 3: Record only the actual result**

Replace the Java-blocked note in `QA_REPORT.md` with the exact pass count and date. Mark the Emulator item complete in `PR_BODY.md` and `SUBMISSION_CHECKLIST.md` only if the command exits `0`.

### Task 1a: Enforce the staff-only announcement requirement without closing entry

**Files:**
- Modify: `emulator/channel-rules-smoke.mjs`, `emulator/README.md`, `tests/firebase-channels.test.mjs`
- Update after successful live configuration: `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md`, `QA_REPORT.md`, `PR_BODY.md`, `SUBMISSION_CHECKLIST.md`

**Interfaces:**
- Consumes: the existing `postingRoles` Firestore rule and one existing Firebase member profile.
- Produces: global GitHub self-enrollment remains enabled; `#announcements` is readable by members but accepts posts only from a `staff` profile; staff remains unable to bypass private-channel or DM reads.

- [x] **Step 1: Add behavioral Rules coverage**

Seed a `staff` fixture and an `announcements` channel with `postingRoles: ["staff"]`. Prove a normal-member write fails, a staff write succeeds, and the staff fixture remains denied from an unrelated private channel and DM.

- [x] **Step 2: Re-run both automated suites**

```bash
npm test
cd emulator
npm run test:emulator
cd ..
```

Expected: root validation remains green and the Emulator reports the new announcement authorization case.

- [x] **Step 3: Configure the live documents and record only observed results**

In Firebase Console, change the existing owner `members/{UID}` document to `role: "staff"`, then set the existing `channels/announcements` document to `postingRoles: ["staff"]`. Recheck that global `accessMode: "open"` stays unchanged. Update evidence only after verifying those exact values.

### Task 2: Complete live two-account privacy and realtime QA

**Files:**
- Update after observation: `QA_REPORT.md`, `PR_BODY.md`, `SUBMISSION_CHECKLIST.md`
- Verify: `DEPLOYMENT.md`

**Interfaces:**
- Consumes: two distinct GitHub-authenticated browser profiles and production URL `https://vera-ae3af.web.app`.
- Produces: evidence that both accounts self-enrol, messages/replies/reactions arrive realtime, and a third account cannot read a 1:1 DM.

- [ ] **Step 1: Prepare accounts**

Use three distinct GitHub accounts in separate browser profiles: Account A, Account B, and Account C. Each opens `https://vera-ae3af.web.app`, signs in, and appears as an active `member` without an approval step.

- [ ] **Step 2: Exercise realtime behavior**

With Account A and Account B in `#general`, send a message, reply in its thread, add a reaction, and mention Account B. Confirm each change appears in Account B without refresh.

- [ ] **Step 3: Exercise privacy behavior**

Create a 1:1 DM from Account A to Account B. Confirm the conversation and a sent message are visible in A and B, then confirm Account C cannot find or open that conversation.

- [ ] **Step 4: Record results**

Add account-independent observations and timestamps to `QA_REPORT.md`, then mark the matching `PR_BODY.md` and `SUBMISSION_CHECKLIST.md` items complete only if every check passed.

### Task 3: Configure the actual winning PM platform

**Files:**
- Modify: `config.js`
- Update: `PR_BODY.md`, `SUBMISSION_CHECKLIST.md`
- Verify: `src/adapters/firebase.js`, `src/app.js`

**Interfaces:**
- Consumes: the exact winning platform name, HTTPS base URL, and HTTPS cohort board URL supplied by the project owner.
- Produces: `window.RELAY_CONFIG.pmPlatform` with real URLs and task/board links that open the selected platform.

- [x] **Step 1: Obtain the three authoritative values**

Require these exact user-supplied values before editing:

```text
pmPlatform.name
pmPlatform.baseUrl
pmPlatform.boardUrl
```

Do not infer any URL from the cohort site or a generic platform homepage.

- [x] **Step 2: Replace only the three PM configuration values**

In `config.js`, set the values under `pmPlatform` to the three supplied HTTPS values. Keep `attachmentsEnabled: false` and all Firebase browser configuration unchanged.

- [x] **Step 3: Verify both visible targets**

Open the `ship-room` board card and attach a task card using the configured platform. Confirm both links open the supplied HTTPS URLs.

- [x] **Step 4: Complete the PR text**

Replace `[WINNING PM PLATFORM NAME]` and `[PM PLATFORM URL]` in `PR_BODY.md` with the same supplied values and mark PM validation complete only after Step 3.

### Task 4: Put Relay into the cohort Git repository and create the PR

**Files:**
- Copy into the cohort repository: complete `relay65/` project directory
- Verify: `PR_BODY.md`, `SUBMISSION_CHECKLIST.md`

**Interfaces:**
- Consumes: a local clone of `rogerSuperBuilderAlpha/hult-cohort-program` authenticated to push as `zukhriddingit`.
- Produces: branch `participants/summer26/phase-1-project-2/zukhriddingit` and a PR targeting `projects/summer26/phase-1-project-2` with title `[Project 2] Submission — zukhriddingit`.

- [ ] **Step 1: Locate the existing cohort clone or clone it into an approved directory**

Run this in the selected cohort repository:

```bash
git remote -v
git fetch origin
git switch projects/summer26/phase-1-project-2
git pull --ff-only origin projects/summer26/phase-1-project-2
```

Expected: the remote is `rogerSuperBuilderAlpha/hult-cohort-program` and the base branch is current.

- [ ] **Step 2: Create the exact submission branch**

```bash
git switch -c participants/summer26/phase-1-project-2/zukhriddingit
```

Expected: Git reports the new branch name exactly.

- [ ] **Step 3: Copy the verified Relay project and inspect the diff**

Copy the complete verified `relay65/` directory into the submission location required by the cohort repository. Before staging, run:

```bash
git status --short
git diff --check
```

Expected: only Relay submission files are new or changed; no secret files appear.

- [ ] **Step 4: Commit and push**

```bash
git add relay65
git commit -m "feat: ship Relay 65 cohort communications platform"
git push -u origin participants/summer26/phase-1-project-2/zukhriddingit
```

Expected: push succeeds and Git prints the remote branch URL.

- [ ] **Step 5: Create the PR**

Create a PR with:

```text
Title: [Project 2] Submission — zukhriddingit
Base: projects/summer26/phase-1-project-2
Head: participants/summer26/phase-1-project-2/zukhriddingit
Body: completed relay65/PR_BODY.md
```

Expected: the PR URL is recorded in `SUBMISSION_CHECKLIST.md` and the final merge happens before the cohort deadline.

## Self-review

- Scope coverage: Task 1 covers the local Rules gate; Task 2 covers live realtime/privacy evidence; Task 3 covers the unprovided PM configuration; Task 4 covers repository, branch, push, and PR creation.
- Placeholder scan: no implementation value is invented; Task 3 deliberately requires the owner’s authoritative PM values before a configuration edit.
- Interface consistency: all deployment commands preserve the Spark-only target set and the exact submission identity documented in `SUBMISSION_CHECKLIST.md`.
