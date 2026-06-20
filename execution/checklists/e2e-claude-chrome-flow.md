# E2E test — Claude in Chrome (application → submission → review → tally)

Copy everything below the line into **Claude in Chrome** (or paste phase-by-phase). This walks the full cohort platform flow using the **Roger Hunt** test identity.

**Live site:** https://site-nine-rouge-68.vercel.app  
**GitHub account:** `rogersuperbuilderalpha` (Roger Hunt)  
**Cohort repo:** https://github.com/rogerSuperBuilderAlpha/hult-cohort-program  
**Take-home repo:** https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26  

**Last full run (Jun 2026):** Phases 1–8 PASS — apply through staff tally verified in production.

---

## Pre-flight (staff)

Reset Roger for a fresh run:

```bash
cd execution/marketing/site
node scripts/find-user.mjs "Roger Hunt"
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<uid> --confirm
```

**Open review week before Phase 7** (production schedule is Oct 2026). Pick one:

1. **Env override (preferred):** set `REVIEW_WINDOW_OVERRIDE=open` on Vercel, redeploy.
2. **Temporary dates:** move `phase-1-project-1` `reviewOpens`/`reviewCloses` in `content/program.ts` to wrap today, deploy, **revert after testing**.

**Fix peer data if deploy link 404s:** ensure eligible peers have a real `repo` + `deployUrl` in Firestore (Jordan was patched to `rogerSuperBuilderAlpha/hult-cohort-program` + live site URL for E2E).

**Peer note:** With 2 enrolled, peer denominator is **1** (`@jordanlee-dev`).

---

## Automation gotchas (learned from live runs)

| Gotcha | Workaround |
|--------|------------|
| GitHub web editor auto-continues `- [x]` task lists | Paste file content; use prose labels instead of checklist syntax (Phase 5–6) |
| Pre-merge on `main` | Stop at step 8; confirm PR URL, title, single-file diff before merge |
| **Save review** input | **Type** into the field — programmatic fill does not fire React `onChange`; button stays disabled |
| Staff CLI steps | Agent cannot run `admissions.mjs`; staff runs and reports; agent verifies client state |
| Live vote totals | Never shown during review week — only your own 1/1 counts |

---

## PROMPT — paste into Claude in Chrome

```
You are QA-testing the Hult Cohort platform end-to-end in Chrome. Work carefully, one phase at a time. After each phase, report PASS/FAIL and what you observed. Stop and ask me if GitHub OAuth or a staff CLI step blocks you.

Constants:
- SITE=https://site-nine-rouge-68.vercel.app
- HANDLE=rogersuperbuilderalpha
- REPO=rogerSuperBuilderAlpha/hult-cohort-program
- TAKE_HOME=rogerSuperBuilderAlpha/admissions-task-board-fall26

Test applicant profile (use unless I say otherwise):
- First name: Roger
- Last name: Hunt
- Email: ludwitt@ludwitt.com
- Timezone: America/New_York
- Campus: Boston
- Referral: Founder network
- Motivation: (any 2–3 sentences about building production software with agents)
- Project 1 idea: (any PM platform idea, ~50 words)

---

### Phase 1 — Landing & apply sign-in

1. Open SITE/
2. Confirm hero loads, enrolled count visible, Apply CTA present.
3. Click Apply (or go to SITE/apply).
4. Click **Sign in with GitHub**. Complete OAuth as rogersuperbuilderalpha.
5. PASS if: signed-in bar shows @rogersuperbuilderalpha and the application form appears (not dashboard, not take-home steps).

---

### Phase 2 — Submit application

1. Fill all required fields with the test profile above.
2. Check all three confirmation checkboxes (tuition, public work, policies).
3. Click **Submit application**.
4. PASS if: page switches to take-home steps (headline mentions take-home / PR). No error banner.

---

### Phase 3 — Take-home (GitHub) OR staff fast-path

**Option A — Real take-home (45–60 min):**
1. Open https://github.com/TAKE_HOME
2. Clone, npm install, npm test (3 failures expected), fix bugs, npm test green.
3. Branch: admissions/rogersuperbuilderalpha
4. PR title: [Admissions] Fix task board — rogersuperbuilderalpha
5. Merge PR. Tell staff to set status take-home-submitted.

**Option B — Staff fast-path (skip repo work):**
Ask staff to run:
```bash
cd execution/marketing/site
node scripts/admissions.mjs set-status --handle=rogersuperbuilderalpha --status=take-home-submitted --confirm
node scripts/admissions.mjs admit --handle=rogersuperbuilderalpha --display-name="Roger Hunt" --campus=boston --confirm
```
Then refresh SITE/apply — should redirect to SITE/dashboard within a few seconds.

PASS if: SITE/dashboard loads with greeting, profile shows @rogersuperbuilderalpha, status Enrolled.

---

### Phase 4 — Dashboard & program navigation

1. On SITE/dashboard, confirm progress list shows all projects.
2. Click through to active project link (or SITE/program/onboarding).
3. Open SITE/program — all 8 projects listed.
4. Open SITE/program/phase-1-project-1 — requirements visible; enrolled user sees **Your progress** panel.
5. PASS if: participant panels render; no "sign in" gate.

---

### Phase 5 — Onboarding submission PR

1. On SITE/program/onboarding, note expected PR title: `[Onboarding] Tooling checklist — rogersuperbuilderalpha`
2. On GitHub REPO, create branch, add a minimal file (paste content — do not type `- [x]` lists).
3. Open PR with exact title above. STOP: confirm URL, title, single-file diff with staff before merge.
4. Merge PR to main.
5. Wait ~30s, refresh onboarding project page.
6. PASS if: progress shows **Submission PR merged** with "View your PR" link.

If webhook missed: ask staff to run `node scripts/reconcile-submissions.mjs`

---

### Phase 6 — Phase 1 project submission (PM platform)

1. Open SITE/program/phase-1-project-1.
2. PR title: `[Project 1] Submission — rogersuperbuilderalpha`
3. PR body MUST include: `Production URL: https://site-nine-rouge-68.vercel.app`
4. STOP: confirm PR with staff before merge.
5. Merge PR, refresh project page.
6. PASS if: **Submission PR merged** + **deploy** link matches Production URL.

---

### Phase 7 — Peer review & vote

**Precondition:** Staff opened review week (`REVIEW_WINDOW_OVERRIDE=open` or temporary program.ts dates).

Peer: @jordanlee-dev on repo `rogerSuperBuilderAlpha/hult-cohort-program`.

1. Refresh SITE/program/phase-1-project-1 — review week must be open (not "not yet opened").
2. Expand @jordanlee-dev accordion; verify deploy link loads.
3. Create GitHub issue on PEER_REPO titled exactly: `Review by @rogersuperbuilderalpha`
4. **Type** (do not only paste) the issue URL into **Save review** → submit.
5. Cast 👍 for @jordanlee-dev.
6. PASS if: **1/1 written reviews** and **1/1 private votes**; peer card shows Complete.

If 403 or verification error: report to staff (GITHUB_TOKEN on Vercel).

---

### Phase 8 — Staff tally

Ask staff:
```bash
node scripts/tally-votes.mjs --project=phase-1-project-1
```
PASS if: ranked table shows vote counts; winner = most 👍.

---

### Phase 9 — Cleanup (optional re-test)

```bash
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<uid> --confirm
```
Revert `REVIEW_WINDOW_OVERRIDE` and any temporary program.ts dates after testing.

---

Report: Phase | PASS/FAIL/BLOCKED | Notes
```

---

## Quick reference — PR titles

| Project | PR title |
|---------|----------|
| Onboarding | `[Onboarding] Tooling checklist — rogersuperbuilderalpha` |
| Project 1 | `[Project 1] Submission — rogersuperbuilderalpha` |
| Project 2 | `[Project 2] Submission — rogersuperbuilderalpha` |
| Project 3 | `[Project 3] Submission — rogersuperbuilderalpha` |
| Unification | `[Unification] Integration PR — rogersuperbuilderalpha` |
| P2 Learning | `[P2-L1] Submission — rogersuperbuilderalpha` |
| P2 Venture | `[P2-Venture] Submission — rogersuperbuilderalpha` |
| P2 OSS | `[P2-OSS] Tracking — rogersuperbuilderalpha` |

## Staff CLI cheat sheet

```bash
cd execution/marketing/site

node scripts/admissions.mjs list
node scripts/admissions.mjs set-status --handle=rogersuperbuilderalpha --status=take-home-submitted --confirm
node scripts/admissions.mjs admit --handle=rogersuperbuilderalpha --display-name="Roger Hunt" --campus=boston --confirm
node scripts/reconcile-submissions.mjs
node scripts/backfill-deploy-urls.mjs --from-github
node scripts/tally-votes.mjs --project=phase-1-project-1
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<uid> --confirm
```

## Post-test revert checklist

- [ ] Restore production review dates in `content/program.ts` (Oct 2–3 for Project 1)
- [ ] Remove `REVIEW_WINDOW_OVERRIDE=open` from Vercel if set
- [ ] Optional: delete test PRs/branches/issues on cohort repo
- [ ] Optional: reset Roger via `delete-user.mjs` for next run
