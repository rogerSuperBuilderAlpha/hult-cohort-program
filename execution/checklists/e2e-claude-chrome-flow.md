# E2E test — Claude in Chrome (application → submission)

Copy everything below the line into **Claude in Chrome** (or paste phase-by-phase). This walks the full cohort platform flow using the **Roger Hunt** test identity.

**Live site:** https://site-nine-rouge-68.vercel.app  
**GitHub account:** `rogersuperbuilderalpha` (Roger Hunt)  
**Cohort repo:** https://github.com/rogerSuperBuilderAlpha/hult-cohort-program  
**Take-home repo:** https://github.com/rogerSuperBuilderAlpha/admissions-task-board-fall26  

---

## Pre-flight (staff — already done for this run)

Roger's platform data was wiped so you can apply fresh:

```bash
cd execution/marketing/site
node scripts/find-user.mjs "Roger Hunt"          # should show 0 matches
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<uid> --confirm  # if re-reset needed
```

**Schedule note (Jun 2026):** Program submission/review windows in `content/program.ts` start Sep 2026. For E2E before launch, `phase-1-project-1` review week is temporarily opened **Jun 19–30, 2026** in `program.ts`, or set `REVIEW_WINDOW_OVERRIDE=open` on Vercel. Revert after testing.

**GitHub web editor gotcha:** CodeMirror auto-continues markdown task lists (`- [x]`). Paste file content instead of typing line-by-line, or use prose field labels (Phase 6 pattern).

**Pre-merge gate:** Always stop and confirm PR URL/title/files before merging to `main`.

**Peer note:** After Roger is admitted, `@jordanlee-dev` is the only other roster member — peer review denominator will be **1 peer** until more students are admitted.

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
2. On GitHub REPO, create branch, add a minimal checklist file or edit README, open PR with exact title above.
3. Merge PR to main.
4. Wait ~30s for webhook, refresh onboarding project page.
5. PASS if: progress checklist shows **Submission PR merged** with link to your PR.

If webhook missed:
```bash
node scripts/reconcile-submissions.mjs
```

---

### Phase 6 — Phase 1 project submission (PM platform)

1. Open SITE/program/phase-1-project-1.
2. Note PR title: `[Project 1] Submission — rogersuperbuilderalpha`
3. PR body MUST include a line like:
   ```
   Production URL: https://your-deploy.vercel.app
   ```
   (Webhook parses this into deployUrl for peer review "try deploy" links.)
4. Merge PR on REPO.
5. Refresh project page — confirm merged + deploy link appears in progress panel.

PASS if: submission merged; deploy URL visible (if included in PR body).

---

### Phase 7 — Peer review & vote (review week only)

**Precondition:** Review window open for phase-1-project-1 (Oct 2–3, 2026 in production schedule, or dates temporarily moved for testing).

Eligible peer: @jordanlee-dev (must have merged submission too).

For each peer accordion on SITE/program/phase-1-project-1:

1. Expand peer card.
2. Click deploy link (if present) — note if it loads.
3. Open peer's repo on GitHub, file issue titled `Review by @rogersuperbuilderalpha`.
4. Paste issue URL into **Save review** field → submit.
5. Cast 👍 or 👎 — should succeed only after written review saved.
6. PASS if: progress counts increment (written reviews 1/1, votes 1/1 when one peer eligible).

If review window closed/not-yet: report BLOCKED with window status shown on page.

---

### Phase 8 — Staff tally (after review week)

Ask staff:
```bash
node scripts/tally-votes.mjs --project=phase-1-project-1
```
PASS if: ranked table prints with Roger and jordanlee-dev vote counts.

---

### Phase 9 — Account cleanup (optional re-test)

To run this script again from scratch:
```bash
node scripts/find-user.mjs "Roger Hunt"
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<firebaseUid> --confirm
```
Or use **Delete account** on SITE/apply (type handle to confirm) while signed in.

---

Report a final summary table: Phase | PASS/FAIL/BLOCKED | Notes
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

# List applications
node scripts/admissions.mjs list

# Advance applicant
node scripts/admissions.mjs set-status --handle=rogersuperbuilderalpha --status=take-home-submitted --confirm
node scripts/admissions.mjs admit --handle=rogersuperbuilderalpha --display-name="Roger Hunt" --campus=boston --confirm

# Backfill missed webhooks
node scripts/reconcile-submissions.mjs
node scripts/backfill-deploy-urls.mjs --from-github

# Tally winners
node scripts/tally-votes.mjs --all

# Reset for re-test
node scripts/delete-user.mjs --handle=rogersuperbuilderalpha --uid=<uid> --confirm
```
