# Student-Experience Review — Application → Cohort Completion

> **Historical review (pre GitHub-native votes).** Voting is now public optional `Vote: up` on GitHub review issues — see [governance/winner-selection.md](../governance/winner-selection.md). Do not treat private 👍/👎 or `written-reviews-server.ts` paths in this doc as current.

**Date:** 2026-07-06 · **Cohort:** `summer26` (starts 2026-07-13) · **Reviewer:** platform audit pass
**Method:** live walkthrough of the deployed site (`site-nine-rouge-68.vercel.app`) as an anonymous
visitor + code review of the handling path behind every stage. Contest flows (submission ingest,
peer review, voting) are calendar-gated (windows open Jul 27+) and were reviewed from server code
rather than driven live. Enrolled/signed-in surfaces were captured live where a session was
available and otherwise confirmed from code.

This is a **findings + backlog** deliverable. Nothing in product code was changed. Severities:

- **P0 — fix before cohort start:** real student impact during the live cohort, no clean workaround.
- **P1 — high:** misleading or fragile; will bite during the cohort.
- **P2 — polish / dev-quality:** drift, duplication, copy mismatches, prototype code.

---

## Journey map

| # | Stage | What the student does | Primary code path | Live status |
|---|-------|-----------------------|-------------------|-------------|
| 0 | Entry / funnel | Lands on `/`, `/start`, `/overview`; clicks Apply | `app/page.tsx`, `ParticipantCta.tsx`, `use-enrollment-hub.ts` | ✅ live |
| 1 | Application form | GitHub sign-in → fill form → submit | `app/apply/page.tsx`, `use-github-auth.ts` | ✅ live (gate) |
| 2 | Submit API | POST application | `app/api/applications/route.ts`, `lib/applications.ts` | ⬛ code |
| 3 | Take-home | Fork repo, fix bugs, open PR | `execution/admissions-take-home/`, `lib/email-templates.mjs` | ⬛ code |
| 4 | Admission | Receives admit email, added to roster | `scripts/admissions.mjs`, `lib/mailgun.mjs` | ⬛ code |
| 5 | Roster gate | Sign in → routed by enrollment state | `app/api/me/route.ts`, `lib/enrollment-server.ts` | ⬛ code |
| 6 | Onboarding | First PR into roster repo | `content/program.ts`, `lib/personalize-program.ts` | ⬛ code |
| 7 | Program pages | Browse projects, expectations, progress | `app/program/**`, `ProgramProjectView.tsx` | ✅ live (public) |
| 8 | Submission flow | Open PR → tracked as merged | `app/api/github/webhook/route.ts`, `submission-*-server.ts` | ⬛ code |
| 9 | Dashboard | Sees status, progress, active focus | `app/dashboard/page.tsx`, `/api/dashboard` | 🔶 gate live, enrolled=code |
| 10 | Peer review | Written GitHub review → save URL | `PeerRatingBoard.tsx`, `written-reviews-server.ts` | ⬛ code |
| 11 | Voting | Private 👍/👎 after review | `ratings-server.ts`, `review-window-guard.ts` | ⬛ code |
| 12 | Tally | (staff) winner selection | `scripts/tally-votes.mjs`, `governance/winner-selection.md` | ⬛ code |
| 13 | Phase 2 & completion | Metrics gates; pass/fail | `content/program.ts`, `execution/ludwitt-hult-api/`, `assessment/pass-fail.md` | ⬛ code |

**Strongest part of the platform:** the enrollment gate. `resolveEnrollment` +
`requireEnrolledSession` centralize the roster-over-application precedence, and it is applied
consistently across `/api/me`, `/api/dashboard`, and `/api/program/[slug]/progress`. Voting
integrity (self-vote block, eligible-peer check, no-vote-without-review, idempotent overwrite, the
`0d1b0a9` atomic-update race fix) is genuinely well-guarded server-side.

---

## Findings backlog

### ✅ Fixed in the follow-up pass (2026-07-06, afternoon)

- **P0-1 · Phase-2 "active focus" (Stage 9).** `resolveScheduleContext` now returns
  `activeProjects` (every project whose window contains `now`) alongside the back-compat
  `activeProject`; the dashboard renders all concurrently active projects and the "Active this
  week" badge uses the full set. Files: `lib/program-schedule.ts`, `app/dashboard/page.tsx`.
- **P0-2 · Review-week `GITHUB_TOKEN` dead-end (Stage 10).** Confirmed `GITHUB_TOKEN` **is set** in
  Vercel production. Code hardened: GitHub fetches now distinguish auth failures (401/403, logged
  loudly as a platform-side misconfiguration) from transient outages (5xx/network, retried once)
  from real 404s, with student-facing copy that never blames their link; the unset-token
  production branch also logs loudly. File: `lib/written-reviews-server.ts`.
- **P0-3 · No completion surface (Stage 13).** The dashboard now has a read-only "Completion
  standing" section: per-project pass-gate text (personalized via `personalizeProgramText`), a
  tracked-requirements completion count, and an explicit note that staff-verified gates (tooling
  verification, unification demo, Phase-2 outcome metrics) are confirmed by staff after week 6.
  Wiring the live metrics API remains open (see P2-9). File: `app/dashboard/page.tsx`.
- **P1-1 · Stuck "Loading your progress…" (Stage 9).** A null `getIdToken()` now sets a visible
  error ("Could not read your session. Refresh the page to try again.") instead of returning
  silently. File: `app/dashboard/page.tsx`.
- **P1-3 · Written-review grandfathering (Stage 10).** `hasWrittenReview` re-verifies the cached
  issue against GitHub at vote time (author, not-a-PR, exact title). A deleted/edited issue drops
  the stale cache entry and falls through to fresh discovery; GitHub outages trust the cache
  rather than blocking votes. File: `lib/written-reviews-server.ts`.
- **P1-5 · "Sixteen weeks at a glance"** → "Six weeks at a glance". File: `app/start/page.tsx`.
- **P1-6 · "Qualified applicants" copy (Stage 1).** `/apply` lead now says the take-home is issued
  after submission ("After you submit, you receive…"), matching actual behavior. File:
  `app/apply/page.tsx`.
- **P2-3 · Verification-copy mismatch.** Panel copy and aria-label now both say links are verified
  when saved **and** re-checked at vote time (true after the P1-3 fix). File:
  `components/ProjectProgressPanel.tsx`.
- **P2-4 · Raw `.replace('{handle}')`** → canonical `personalizeProgramText`. File:
  `components/ProjectProgressPanel.tsx`.
- **P2-8 · Staff-notify default** `roger@ludwitt.com` → `cohort@hult.edu`
  (`ADMISSIONS_NOTIFY_EMAIL` env still overrides). File: `lib/email-server.ts`.
- **P2-10 · Deactivated-member dead-end (Stage 5).** The dashboard now shows a tailored
  "Enrollment deactivated" message for `enrollment.state === 'inactive'` instead of the generic
  "Not enrolled. Apply…" prompt. File: `app/dashboard/page.tsx`.

### ✅ Fixed in backlog pass (2026-07-06, evening)

- **P1-7 · Acceptance email / canonical URL.** Set `NEXT_PUBLIC_SITE_URL=https://cohorts.algorithmacy.org`
  in Vercel production; shared `lib/site-url.mjs` with loud fallback warnings in CLI + `getSiteUrl()`.
  Redeploy required for live canonical/OG tags. Files: `lib/site-url.mjs`, `lib/mailgun.mjs`,
  `lib/site-config.ts`, `.env.example`.
- **P1-2 · Take-home automation (Stage 3).** Webhook now ingests `pull_request` opened/reopened on
  the admissions take-home repo → `take-home-submitted` + `takeHomeSubmittedAt`/`takeHomePrUrl`.
  Staff helper: `scripts/install-take-home-webhook.mjs` (run with prod `GITHUB_WEBHOOK_SECRET`).
  Files: `lib/admissions-ingest-server.ts`, `app/api/github/webhook/route.ts`, `scripts/admissions.mjs`.
- **P1-4 · Rate-limit hardening (light).** `clientIp()` prefers `x-vercel-forwarded-for` and
  `x-real-ip`; file header documents per-instance best-effort limits. Shared Redis deferred.
  File: `lib/rate-limit.ts`.
- **P2-12 · Survey gate preview (Stage 7).** Locked projects show requirements read-only behind the
  survey banner; progress/peer-review actions stay hidden until the gate clears. File:
  `components/ProgramProjectView.tsx`.
- **P2-1 · Take-home URL constant.** `DEFAULT_TAKE_HOME_REPO_URL` + `takeHomeRepoFullName()` in
  `lib/applications.ts`; apply page reads the same fallback (live GitHub repo rename still optional ops).
- **P2-2 · Apply form polish.** Character counters (1500/800), removed dead `githubHandle` hidden
  field, explicit post-submit success panel. File: `app/apply/page.tsx`.
- **P2-5 · Deploy URL dedup.** Shared `lib/deploy-url.mjs`; removed deprecated
  `getParticipantSubmissionsLegacyFirestore`. Files: `lib/deploy-url.mjs`, `submission-ingest-server.ts`,
  `scripts/backfill-deploy-urls.mjs`.
- **P2-6 · Tally single source.** `content/vote-week-projects.json` + verify assertion in
  `verify-submission-titles.ts`; ties report all handles for staff rubric-median (no silent code winner).
  File: `scripts/tally-votes.mjs`.
- **P2-7 · Email path unify.** `admissions.mjs` routes through `sendEmail()` / `mailer.mjs`; cohort
  week-1 date in `lib/cohort-dates.mjs`. Files: `scripts/admissions.mjs`, `lib/email-templates.mjs`.
- **P2-9 · Metrics API hardening (partial).** CSV export escaped, exact-handle block check (no
  substring false positives), production requires explicit `ADMIN_KEY`. In-memory store + site wiring
  still open. Files: `execution/ludwitt-hult-api/src/store.js`, `src/server.js`.
- **P2-11 · Nav labels.** `/program` link labeled "Program" on home, start, overview. Files:
  `app/page.tsx`, `app/start/page.tsx`, `app/overview/page.tsx`.

### ✅ Fixed during this review

- **Weak "click into a week" affordance (Stages 7, 9).** The `/program` rows were full-row links but
  showed no persistent click signal — the title only turned accent-colored on `:hover`, so on
  touch/scan they read as static text. On the dashboard, each project title was a link but the
  *active* row was de-styled back to plain dark text, and the status text ran on after it as one
  flat line. **Fix applied:** persistent `→` affordance + hover background + keyboard focus ring on
  `.programLink`; dashboard project titles now render as accent links with a hover underline (incl.
  the active row, via a new dedicated `.dashboardProjectLink` class so the styling can't bleed onto
  the shared `.dashboardProjectItem` rows used by `/history`); and a one-line instruction on both
  surfaces ("Open/Select a project to see its requirements, deadline, and how to submit"). Files:
  `app/page.module.css`, `app/program/page.tsx`, `app/dashboard/page.tsx`. Verified via local dev +
  `npm run build`.

> Rows marked ✅ were fixed in the 2026-07-06 follow-up pass — details in the "Fixed" section above.

### P0 — fix before cohort start

| ID | Stage | Finding | Where | Fix |
|----|-------|---------|-------|-----|
| P0-1 ✅ | 9 · Dashboard | **Phase-2 "active focus" is wrong for 2 of 3 projects.** All three Phase-2 projects share one window (`2026-08-17 → 08-23`); `resolveScheduleContext` returns the *first* match only, so the dashboard "Active focus" and the "Active this week" badge highlight `phase-2-learning-app` alone. `venture` and `open-source` look inactive for the entire final phase. | `program-schedule.ts:79`, `content/program.ts:255,290,325`, `dashboard/page.tsx:164` | Return all projects whose window contains `now` (array), or special-case concurrent Phase-2; render all active projects in the dashboard. |
| P0-2 ✅ | 10 · Peer review | **Review week hard-fails if `GITHUB_TOKEN` is unset in prod.** Every written-review save calls GitHub to verify the issue; with no token it returns "verification temporarily unavailable" — a dead-end that blocks *all* voting cohort-wide, with only an email as recourse. | `written-reviews-server.ts:88-93` | Confirm `GITHUB_TOKEN` is set in Vercel prod **now**; add a startup/health check and a softer fallback (queue for retry) instead of a hard block. |
| P0-3 ✅ | 13 · Completion | **The journey has no ending in the UI.** The site never calls the Phase-2 metrics API, so students cannot see their `qualified_users` against the ≥25 gate, and there is no completion / pass-fail / graduation surface anywhere. A student finishes the cohort with no in-product signal of whether they passed. | grep: site never imports `ludwitt-hult-api`; `pass-fail.md` is prose only | Add a completion/standing view (even read-only) that aggregates Phase-1 progress + Phase-2 metric gates; wire the metrics API or surface staff-entered pass state. |

### P1 — high

| ID | Stage | Finding | Where | Fix |
|----|-------|---------|-------|-----|
| P1-1 ✅ | 9 · Dashboard | Dashboard can stick **permanently on "Loading your progress…"** when `getIdToken()` returns null — the effect returns without setting `summary` or `summaryError`, so the spinner never resolves and there's no retry. | `dashboard/page.tsx:261-262, 340-341` | On null token set an error state + retry affordance; re-run the effect when the token becomes available. |
| P1-2 ✅ | 3 · Take-home | **Take-home status pipeline is 100% manual.** Nothing transitions `submitted → take-home-sent → take-home-submitted`; the webhook ignores the external admissions-task-board repo, and the 48-hour deadline is copy only. At applicant volume, submissions get missed and statuses go stale. | `admissions.mjs` (manual), `app/api/github/webhook/route.ts` (no admissions awareness) | Add admissions-repo PR ingestion → auto-set `take-home-submitted`; track/enforce the 48h window; or drop the two dead intermediate statuses. |
| P1-3 ✅ | 10 · Peer review | **Written-review grandfathering.** `hasWrittenReview` returns `true` on any cached URL without re-checking GitHub, so a review issue **edited or deleted after first save** still counts as valid at vote time. | `written-reviews-server.ts:221-223` | Re-verify the issue at vote time (or on a schedule); don't trust the cached URL blindly. |
| P1-4 ✅ | 2,11 · Abuse | **Rate limiting is effectively bypassable.** The limiter is an in-memory `Map` per serverless instance ("best-effort"), and `clientIp` trusts the first `x-forwarded-for` hop (spoofable). Application spam and vote-rate limits don't hold across instances. | `rate-limit.ts:3,29-34` | Use a shared store (Upstash/Redis/Vercel KV) keyed on a trusted IP header; treat `x-forwarded-for` per Vercel's guidance. |
| P1-5 ✅ | 0 · Funnel | **"Sixteen weeks at a glance"** headline on the public `/start` page for a **six-week** program (the cards below read Week 1, Weeks 2–4, Week 5, Week 6). Factual error on a top-of-funnel marketing page. | `/start` copy (`content/program-intro` / `app/start/page.tsx`) | Change to "Six weeks at a glance." |
| P1-6 ✅ | 1 · Apply | **Copy vs behavior:** `/apply` says "Qualified applicants receive a focused 48-hour technical take-home," but the take-home is auto-issued to **everyone** the moment they submit (status → in-flight → `TakeHomeSteps`). Sets a false expectation of a screening gate. | `apply/page.tsx:280-287`, `enrollment-server.ts:43-49` | Either add a real qualification gate, or change the copy to reflect that the take-home is issued on submit. |
| P1-7 ✅ | 4 · Admission | **Acceptance email links to the vercel.app URL, not the production domain.** `siteUrl()` (`lib/mailgun.mjs`) reads `NEXT_PUBLIC_SITE_URL` and falls back to the hardcoded `https://site-nine-rouge-68.vercel.app`. Verified 2026-07-06: `NEXT_PUBLIC_SITE_URL` exists in Vercel production but is **empty**, so every admission/application email ships the vercel.app link even though the production deployment serves custom domains (`cohorts.ludwitt.com` and aliases). Applies to all links built from `siteUrl()`/`getSiteUrl()` (email dashboard/program links, canonical/OG URLs). | `mailgun.mjs:54-58`, `site-config.ts:2-10`, `email-templates.mjs:30,41-42`; prod env | Set the canonical production domain: `vercel env rm NEXT_PUBLIC_SITE_URL production` then `vercel env add NEXT_PUBLIC_SITE_URL production` with e.g. `https://cohorts.ludwitt.com`, and redeploy. Staff-run `admissions.mjs` shells need the same var set locally. |

### P2 — polish / dev-quality

| ID | Stage | Finding | Where |
|----|-------|---------|-------|
| P2-1 ✅ | 3,5 · Naming | Take-home repo + roster template named `...-fall26` while the live cohort runs `summer26` — the single most likely source of applicant confusion moving apply → participant. | `applications.ts:113`, `apply/page.tsx:21`, `data/roster-fall26-template.csv` |
| P2-2 ✅ | 1 · Apply | Word-count copy ("200 words max" / "100 words") vs **character**-limit-only enforcement (1500/800, no counter); dead hidden `githubHandle` field the API ignores; no explicit submit-success toast (form just disappears). | `apply/page.tsx` |
| P2-3 ✅ | 10 · Peer review | Written-reviews aria-label says "verified at **vote** time" but verification is actually **synchronous at save** — two different verification points, confusing copy. | `ProjectProgressPanel.tsx:135` |
| P2-4 ✅ | 6 · Onboarding | `ProjectProgressPanel` uses raw `.replace('{handle}', handle)` instead of the canonical `personalizeProgramText`; works for onboarding but won't resolve `{org}`/`{repo}` and diverges from the helper. | `ProjectProgressPanel.tsx:97` |
| P2-5 ✅ | 8 · Submissions | `extractDeployUrl` duplicated verbatim between lib and the backfill script (drift risk); deprecated-but-still-exported helpers (`getParticipantSubmissionsLegacyFirestore`, `backfill-roster-submissions.mjs`). | `submission-ingest-server.ts:62-93` vs `scripts/backfill-deploy-urls.mjs:14-40` |
| P2-6 ✅ | 12 · Tally | `VOTE_WEEK_PROJECTS` slug list hardcoded in the tally script, duplicated against `content/program.ts` `voteWeek` flags and governance docs (3 sources); code tie-break (mergedAt/handle) can diverge from governance's rubric-median rule. | `tally-votes.mjs:14`, `governance/winner-selection.md` |
| P2-7 ✅ | 4 · Admission | Two divergent email paths (CLI `mailgun.mjs` vs API `mailer.mjs`); admission email has hardcoded dates ("July 13, 2026") + a hardcoded fallback Vercel URL; silently skips if `EMAIL_*` unset. | `admissions.mjs:90-94`, `email-templates.mjs` |
| P2-8 ✅ | 2,4 · Ops | Staff-notify default address is a personal `roger@ludwitt.com` while the public contact everywhere is `cohort@hult.edu`. | `email-server.ts:14` |
| P2-9 ✅ | 13 · Metrics | Phase-2 metrics service is a **prototype**: in-memory store (lost on restart), hardcoded demo dev keys + `dev-admin-key` default, **unescaped CSV export** (handle/id injection), naive `user_id.includes(handle)` block check (false positives). Not production-wired. | `ludwitt-hult-api/src/store.js:46,81`, `src/server.js:92` |
| P2-10 ✅ | 5 · Roster gate | Deactivated (`inactive`) roster member falls through to the generic "Not enrolled. Apply…" message — no tailored state for a removed participant. Also: non-active users can self-delete their account (acceptable, but note the admitted-pending-roster window). | `dashboard/page.tsx:329-336`, `me/route.ts:91` |
| P2-11 ✅ | 0 · Funnel | Nav label inconsistency across funnel pages (same `/program` destination labeled "Projects", "Program", and paired with "Visual intro"/"What is this?"); three front doors with divergent inline date phrasing. | `app/page.tsx`, `app/start/page.tsx`, `app/overview/page.tsx` |
| P2-12 ✅ | 7 · Program | **Survey gate replaces the entire project view** (confirmed live: Phase-1 Project 1 shows only "Project management platform unlocks after you complete the baseline survey… survey opens Jul 9, 2026"). An enrolled student cannot preview requirements or submission instructions, and before the survey opens there is no visible action (no opt-out button yet) — only Dashboard / All projects. If the survey infra fails mid-cohort it hard-blocks a contest project. | `ProgramProjectView.tsx:36-79` (`SurveyGateNotice`), `/api/research/survey` |

---

## Verification notes

- **Live-confirmed anonymous:** landing, `/apply` sign-in gate + cookie banner, `/start`
  ("Sixteen weeks" bug), `/overview`, `/program` index, `/program/phase-1-project-1` public view
  (raw placeholders + "23 enrolled, 22 peer reviews" note), `/dashboard` sign-in gate.
- **Live-confirmed enrolled** (signed in as `@rogersuperbuilderalpha`): enrolled dashboard ("0 of 8
  projects merged", all 8 projects + review deadlines, data export, quick links); onboarding
  `EnrolledView` (personalized "@rogersuperbuilderalpha · Cohort 23" banner, "Your progress" panel
  with the resolved PR title, requirements) — personalization confirmed working; Phase-1 Project 1
  survey gate (P2-12).
- **Code-confirmed (read directly this pass):** P0-1, P0-2, P0-3, P1-1, P1-3, P1-4, P2-3, P2-4, P2-6,
  P2-9, and the account-deletion / grandfathering guards.
- **Not exercised live:** the peer-review card UI and voting behavior (calendar-gated — windows open
  Jul 27; also the survey gate hid the Phase-1 project UI). Covered from server code; findings
  unaffected.
- `summer26` production data was not modified during this review.
