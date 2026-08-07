# Dev plan — production-grade for external testers

**Goal:** Anyone you send the link to can apply, get the take-home, enroll, submit PRs, review peers, and vote — without dead ends or security holes. Staff workflows stay backend-only (no admin UI).

**Live today:** https://site-nine-rouge-68.vercel.app (Vercel project `hult-cohort`; alias https://hult-cohort.vercel.app when linked) · Firestore (`hult-cohorts`) · cohort repo `hult-cohort-program`

---

## Remediation complete (Jun 2026)

| Item | Status |
|------|--------|
| Staff admissions CLI (`admit`, `set-status`, `deactivate`) | Done — `execution/marketing/site/scripts/admissions.mjs` |
| Resilient PR title matching (hyphen/en-dash/em-dash) | Done — `lib/submission-title-match.ts` |
| Review-window UI state (disable controls outside window) | Done — progress API + `PeerRatingBoard` |
| Phase 2 venture copy (cohort repo tracking) | Done — `content/program.ts` |
| Production env checker | Done — `npm run check:env` |
| Submission title verification | Done — `npm run verify:submissions` |

---

## Staff operations (no admin UI)

From `execution/marketing/site/` with Firebase service account:

```bash
node scripts/admissions.mjs list [--status=submitted]
node scripts/admissions.mjs set-status --handle=<h> --status=take-home-sent [--confirm]
node scripts/admissions.mjs admit --handle=<h> [--display-name=...] [--campus=...] [--confirm]
node scripts/admissions.mjs deactivate --handle=<h> [--confirm]
node scripts/admissions.mjs audit-signins
node scripts/backup-firestore.mjs
node scripts/reconcile-submissions.mjs   # backstop if webhook misses a merge
```

Writes require `--confirm` (dry-run by default).

**Admit flow:** sets application `status: admitted` and creates/updates `roster/fall26/members/{handle}` with `active: true`. Participant APIs unlock immediately.

---

## Production env checklist (Vercel)

Run locally after pulling env: `npm run check:env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for sitemap/OG |
| `NEXT_PUBLIC_COHORT_REPO` | Yes | Submission webhook target |
| `NEXT_PUBLIC_COHORT_ORG` | Yes | Org placeholder in copy |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Client auth |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes (Vercel) | Admin SDK |
| `GITHUB_TOKEN` | Yes (prod) | Written-review verification |
| `GITHUB_WEBHOOK_SECRET` | Yes | Merged PR ingestion |
| `EMAIL_*` | Recommended | Auto-reply on apply (graceful skip if unset) |
| `NEXT_PUBLIC_TAKE_HOME_REPO_URL` | Recommended | Admissions take-home link |

---

## P0 — Admissions funnel (complete)

- [x] Honest post-submit UX (take-home steps on screen, not "check your email" unless email configured)
- [x] Full apply form + confirmations + honeypot + duplicate guard + rate limit
- [x] Admin SDK-only application writes
- [x] Firestore rules tightened
- [x] Staff admit/roster CLI

## P1 — Production hardening

- [x] Auto-reply email on apply (Mailgun — skips gracefully when `EMAIL_*` unset)
- [x] Staff CLI in `scripts/admissions.mjs`
- [x] OG image, favicon, robots.txt, sitemap
- [x] Structured API logging (`lib/api-log.ts`)
- [x] Firestore backup script (`scripts/backup-firestore.mjs`)
- [x] Rate limiting on API routes
- [ ] **GC sign-off** on guarantee language (blocking for public marketing)
- [ ] **Verify Mailgun DKIM** in production if using email
- [ ] **Confirm Vercel env** via dashboard + `npm run check:env` against pulled production env

## P2 — Participant platform (complete)

- [x] GitHub sign-in (Firebase Auth) + roster gate
- [x] Private 👍/👎 after written GitHub reviews (not ranked-choice)
- [x] GitHub webhook → `submissions` on merged PRs
- [x] Peer review accordion UI + progress dashboard
- [x] Account deletion + data export (GDPR)
- [x] Resilient PR title matching + review-window UX

## P3 — External dependencies

- [ ] Create `hult-cohort` GitHub org; transfer take-home + cohort repos
- [ ] Custom domain `cohort.hult.edu` (Hult IT CNAME)
- [ ] Transactional email domain + DKIM (Mailgun)
- [ ] Update stale governance docs (`PLATFORM.md`, `governance/winner-selection.md`) to match 👍/👎 model

---

## Validation before each launch

From `execution/marketing/site/`:

```bash
npm run build
npm run verify:submissions
npm run check:env   # after vercel env pull
```

Manual smoke:

1. Apply with GitHub → take-home steps visible
2. `admit --handle=... --confirm` → dashboard unlocks
3. Merged cohort-repo PR with `[Project N] Submission - {handle}` ingests via webhook
4. Project page shows progress; review controls respect schedule window

---

## Sequencing note

Email is optional at apply time — on-screen take-home instructions remain the primary path. Restore prominent "check your email" copy only after Mailgun is verified in production.
