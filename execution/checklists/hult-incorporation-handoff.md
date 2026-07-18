# Hult incorporation handoff packet

**Audience:** Hult reviewers evaluating whether to incorporate the Summer Pilot cohort platform.  
**Live site:** https://site-nine-rouge-68.vercel.app (Vercel project `hult-cohort`)  
**Code:** `execution/marketing/site/` · **Firebase:** `hult-cohorts` · **Cohort id:** `summer26`

**Canonical product rules:** [content/program.ts](../marketing/site/content/program.ts) · [governance/winner-selection.md](../../governance/winner-selection.md) · root [AGENTS.md](../../AGENTS.md)

---

## 1. Architecture one-pager

| Layer | Role |
|-------|------|
| **Next.js (Vercel)** | Admissions, dashboard, program pages, APIs |
| **Firebase Auth + Firestore** | Identity, applications, roster, expectations ack, published winners |
| **GitHub** | Contest truth: merged submission PRs, review issues, optional `Vote: up` |

```
Apply (GitHub OAuth) → staff admit CLI → roster active
  → participant merges submission PR → webhook busts cache
  → peers file GitHub issues "Review by @you: @peer" (+ optional Vote: up)
  → site shows personal status only (fetchContestState, ~60s cache)
  → staff CLI tallies → optional projectOutcomes publish → winner banner
```

**Deliberate non-features:** no admin UI, no live scoreboard, no private Firestore ballots.

---

## 2. Participant journey

1. `/apply` — GitHub sign-in, form, honeypot + rate limits → Firestore `applications`
2. Take-home PR → webhook marks `take-home-submitted`
3. Staff: `node scripts/admissions.mjs admit --handle=<h> --confirm`
4. `/dashboard` unlocks; `/program/[slug]` shows expectations + progress
5. Submission PR titled per `program.ts` → merge → progress shows submitted
6. Review week: file GitHub issue on peer app repo; optional `Vote: up` or abstain
7. Refresh progress — personal statuses only (needs review / abstained / upvoted)
8. After window: staff tally + announce; site may show published winner banner

---

## 3. Staff SOPs

From `execution/marketing/site/` with service account configured:

```bash
# Admissions
node scripts/admissions.mjs list [--status=submitted]
node scripts/admissions.mjs admit --handle=<h> --confirm
node scripts/admissions.mjs deactivate --handle=<h> --confirm

# After review week — canonical tally (not cohort-scripts/vote-tally.js)
npx tsx scripts/tally-votes.ts --project=phase-1-project-1
npx tsx scripts/tally-votes.ts --all --json
npx tsx scripts/tally-votes.ts --project=phase-1-project-1 --publish --confirm

# Ops
node scripts/backup-firestore.mjs
npm run check:env          # after vercel env pull
npx tsx scripts/smoke-contest-state.ts   # if present — live GitHub/Firebase smoke
```

Writes require `--confirm` (dry-run by default).

---

## 4. Security model summary

| Control | Implementation |
|---------|----------------|
| Session | Firebase ID token verified with Admin SDK; GitHub handle resolved server-side |
| Enrollment | `requireEnrolledSession` — active roster member |
| Firestore | Deny-all client rules (`execution/marketing/firebase/firestore.rules`) |
| Webhook | HMAC-SHA256 over raw body + `timingSafeEqual` |
| Cron | `Authorization: Bearer CRON_SECRET` (503 in prod if unset) |
| Contest privacy | Full review map stays server-side; clients get personal slice only |
| PII | Applications Admin-SDK only; research surveys use salted participant ids |

No Critical/High findings in the 2026 readiness review. Medium: in-memory (per-instance) rate limits; shared `GITHUB_TOKEN` quota on authenticated progress routes.

---

## 5. Known limitations (honest)

1. **GitHub Search API** — review discovery fans out per peer repo (batched concurrency 3). Rate limits can degrade status; UI shows an explicit incomplete-data banner.
2. **Rate limiting** — soft, per serverless instance (distributed limiter deferred).
3. **No admin UI** — staff CLIs + Firebase Console by design.
4. **External deps open** — custom Hult domain, GitHub org ownership, transactional email DKIM (see DEVPLAN P3).
5. **Institutional decisions open** — GC / EVP / Finance items in [WORKPLAN.md](../../WORKPLAN.md).

---

## 6. Open institutional decisions (not eng blockers)

| Item | Owner |
|------|-------|
| Custom domain (e.g. `cohort.hult.edu`) | Hult IT |
| GitHub org transfer / naming | Founder + Hult |
| Transactional email domain + DKIM | Ops |
| GC sign-off on guarantee / marketing language | General Counsel |
| Credit / certificate (Summer Pilot: none issued via platform) | Academic Affairs |

---

## 7. Live smoke checklist

Against production (or Preview with real env):

1. [ ] `/` and `/overview` render with Hult branding
2. [ ] `/privacy` states reviews + optional `Vote: up` are **public on GitHub** (no “private Firestore votes”)
3. [ ] `/terms` aligns with open-access pilot (no formal credit/certificate via platform)
4. [ ] Apply with GitHub → take-home steps visible on screen
5. [ ] Admit test handle → `/dashboard` unlocks
6. [ ] Merged submission PR appears in project progress
7. [ ] File review issue → refresh progress → personal status updates
8. [ ] Outside review window, filing controls respect schedule
9. [ ] `GET /api/cron/warm-contest` with `CRON_SECRET` returns 200 during open review weeks
10. [ ] Webhook: GitHub delivery history shows 2xx for recent merges/issues
11. [ ] `npx tsx scripts/tally-votes.ts --project=<slug>` prints sensible rows (dry-run)
12. [ ] Unhandled route → branded 404; force a throw in preview → branded error if tested

---

## 8. Engineering quality gates

```bash
cd execution/marketing/site
npm test
npm run verify:submissions
npm run build
```

CI (`.github/workflows/marketing-site.yml`) runs `npm test`, `verify:submissions`, and `build`.
