# Dev plan — production-grade for external testers

**Goal:** Anyone you send the link to can apply, get the take-home, and complete the loop without hitting a lie, a dead end, or a security hole. Staff workflows stay backend-only (no admin UI).

**Live today:** https://hult-cohort.vercel.app · Firestore (`hult-cohorts`) · take-home repo (public, CI green) · monorepo (private)

---

## Audit summary (from E2E session)

### Working and verified

| Item | Evidence |
|------|----------|
| Landing, /overview, /program, /program/[slug] | E2E Phase A — all pass, no console errors |
| Apply → `POST /api/applications` → Firestore (Admin SDK) | HTTP 200, doc verified in Firestore |
| Firestore rules deployed | Create-only on applications enforced |
| Take-home repo + PR template | Phase C pass; starter now 1 pass / 3 fail; repo CI green |
| Staff approve/admit via script | Done twice during E2E (status flips + roster doc) |

### Defects and gaps found

| # | Issue | Severity |
|---|-------|----------|
| 1 | Success message says "check your email" — **no email is ever sent** | 🔴 Blocker — lies to every applicant |
| 2 | Test data in Firestore: 2 applications (`hult-test+…`, `deploy-test2@…`), roster `octocat` | 🔴 Blocker — pollutes real funnel |
| 3 | Apply form missing fields from spec: first/last name, 3 confirmation checkboxes | 🔴 Blocker — staff can't address applicants; no consent record |
| 4 | No duplicate-email guard — same person can submit unlimited applications | 🟠 High |
| 5 | No bot protection on /api/applications (no honeypot, no rate limit) | 🟠 High |
| 6 | Dead client-SDK fallback path in API + apply page (echoes full record to browser) | 🟠 High — confusing, larger bundle, unused |
| 7 | Firestore rules: client create on `applications` unnecessary (Admin SDK bypasses rules); `votes` create open to any authed user | 🟠 High — lock both until needed |
| 8 | Vercel project named `site` → `site-nine-rouge-68.vercel.app` | 🟡 Polish — bad first impression on a shared link |
| 9 | Service-account key still sitting in `~/Downloads` | 🟡 Hygiene — stray credential |
| 10 | Monorepo CI red — GitHub Actions billing on private repos (not a code failure) | 🟡 Noise |
| 11 | "Guaranteed job offer" copy not GC-approved | 🟡 OK for friendly testers; **required before public launch** |
| 12 | No OG image / favicon / robots.txt | 🟡 Polish |

---

## P0 — Before sending the link to testers (~half day)

- [x] **Fix the success screen.** Show the take-home repo link + 48-hour instructions directly on submit success. Stop referencing email until email exists.
- [x] **Add missing form fields:** first name, last name, confirmation checkboxes (GitHub ≥ 6 months / ≥ 5 commits; $10k + $400/mo affordable; public work). Persist `confirmations` map per schema in FIREBASE.md.
- [x] **Duplicate guard:** reject second application with same email for `fall26` (friendly message, 409).
- [x] **Honeypot field** (hidden input; silently drop bot submissions).
- [x] **Remove client-SDK fallback** from `/api/applications` and apply page — single Admin SDK path; stop returning the record body.
- [x] **Tighten Firestore rules:** `applications` → server-only writes; `votes` → locked until vote UI exists. Redeployed.
- [x] **Purge test data:** deleted QA applications and `roster/fall26/members/octocat`.
- [x] **Rename Vercel project** → `hult-cohort` · **https://hult-cohort.vercel.app**
- [x] **Delete stray key** from `~/Downloads`.
- [x] **Silence monorepo CI** (workflows disabled; take-home public repo CI unchanged).
- [x] **Smoke re-test:** apply API 200 + duplicate 409 + Firestore doc with `confirmations`.

**Exit criteria:** A stranger can apply → see honest next-step instructions → land in Firestore exactly once → you approve via script.

## P1 — Production hardening (~1 day, before public/non-friendly launch)

- [ ] **Auto-reply email** on apply via Resend (template #1 from `execution/templates/emails.md`, take-home link from env). Restore "check your email" copy once true.
- [ ] **Staff CLI:** `execution/cohort-scripts/admissions.js` — `list`, `send-take-home <email>`, `admit <email> --pr <url>`, `reject <email>`. Replaces ad-hoc Console edits and one-off scripts.
- [ ] **OG image, favicon, per-route metadata, robots.txt.**
- [ ] **Error visibility:** structured logs in API route; review Vercel logs; optional Sentry.
- [ ] **Firestore export script** (weekly backup of `applications` + `roster`).
- [ ] **GC sign-off** on guarantee language (blocking for public marketing, per WORKPLAN).
- [ ] **App Check / rate limiting** only if spam shows up in logs.

## P2 — Participant platform (~2–3 days, before cohort week 2)

- [ ] **GitHub sign-in** (Firebase Auth) + roster-gated layout for participant routes.
- [ ] **`/vote/[project]`** ranked-choice ballot UI → `votes` collection; rules rewritten with verified handle mapping (custom claim or UID→roster lookup); one ballot per voter, own PR excluded.
- [ ] **GitHub webhook** (org → Vercel route): merged `[Project N] Submission` PRs populate `submissions` + `ballots.eligiblePrs`.
- [ ] **`vote-tally.js`** reads Firestore (instant runoff + rubric tie-break per governance/winner-selection.md).

## P3 — Branding/org (external dependencies)

- [ ] Create `hult-cohort` GitHub org; transfer take-home repo; update `NEXT_PUBLIC_TAKE_HOME_REPO_URL` + docs.
- [ ] Custom domain `cohort.hult.edu` (Hult IT CNAME).
- [ ] Transactional email domain + DKIM (replace Resend default sender).

---

## Sequencing note

P0 is self-contained and unblocks "send to folks." P1's email work changes the success-screen copy again — fine to ship P0's link-on-screen version first; it remains a good fallback even after email exists.
