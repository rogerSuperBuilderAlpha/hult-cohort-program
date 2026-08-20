# User acquisition checklist — Greenularity Caribbean™ / cEAL Green Energy Auditor

**Pass gate:** ≥ **25 qualified external users** with traceable Ludwitt/Hult metrics by snapshot deadline ([metrics.md](../../../../assessment/metrics.md)).

**Your metrics source (declare in PR):** Own instance of the cohort reference API (`execution/ludwitt-hult-api`) — hosted URL + date-stamped `evidence/metrics-snapshot-*.json`.  
*(Hosted `https://api.ludwitt.hult/v1` is not live for summer26; use your deployed reference API until the cohort platform is available.)*

---

## Phase 0 — Ludwitt env fix (do this first)

Production on Vercel **cannot** POST events to `http://localhost:4000`. Until fixed, every calculator session shows `qualified_users: 0`.

### Option A — Deploy reference API (recommended)

1. Deploy `execution/ludwitt-hult-api` to **Render**, **Railway**, or **Fly** (see `execution/ludwitt-hult-api/DEPLOY.md`).
2. Confirm health: `curl https://YOUR-API-HOST/health` → `{"ok":true}`.
3. In `.env.local` set:
   ```env
   LUDWITT_API_BASE_URL=https://YOUR-API-HOST/v1
   LUDWITT_DEVELOPER_KEY=prod_key_demo
   APP_PRODUCTION_URL=https://caribbeanenergyauditor.vercel.app
   ```
4. Re-register the venture app against the **public** API:
   ```bash
   npm run register-app
   ```
5. Update **all** Vercel Production env vars from new `.env.local`:
   - `LUDWITT_APP_ID`, `LUDWITT_JWT_SECRET`, `LUDWITT_API_KEY`
   - `LUDWITT_API_BASE_URL=https://YOUR-API-HOST/v1`
   - `LUDWITT_DEVELOPER_KEY=prod_key_demo` *(events auth uses developer key on reference API)*
6. Redeploy Vercel → verify:
   ```bash
   npm run smoke-test
   ```
   Expect `metrics.qualified_users >= 1` after smoke test.

**Keep the API running** until after `npm run export-metrics`. The reference API stores events in memory — restarts zero counts.

### Option B — Cohort-hosted Ludwitt (when available)

When `https://api.ludwitt.hult/v1` resolves:

1. Register via cohort developer console (not localhost).
2. Set Vercel `LUDWITT_API_BASE_URL=https://api.ludwitt.hult/v1`.
3. List app in platform directory; promote **directory URL**, not raw Vercel URL.

---

## Phase 1 — Verify counting works

- [ ] `npm run smoke-test` → `ok: true`, `qualified_users >= 1`
- [ ] Open production calculator via launch link (not `/calculator` directly)
- [ ] Submit calculator → no 500 on `/api/calculator` or `/api/events`
- [ ] `npm run export-metrics` → `aggregate_qualified_user_count >= 1`

**Qualification rule:** Authenticated opaque `user_id` with a qualifying platform event. This app maps `calculator_completed` → `quiz_submitted`.

---

## Phase 2 — Who counts (anti-gaming)

| Counts | Does **not** count |
|--------|---------------------|
| Unique external `user_id` via authenticated launch | Cohort member accounts |
| ≥ 1 qualifying event (`quiz_submitted` / `lesson_started` / `lesson_completed`) | Page view only (no launch) |
| Opaque ids (`external-jm-facility-03`, etc.) | User ids containing **`ryanroper79`** |
| Real people you invite | Duplicate same person with many ids (deduped by email on real platform) |
| | Self-test accounts you use for QA after gate is met |

---

## Phase 3 — How users must enter

Users **must** start at an authenticated launch URL:

```
https://caribbeanenergyauditor.vercel.app/launch?token=...
```

**Do not** send people to `/calculator` alone — they will not be counted.

### Without cohort directory (reference API launcher)

Generate one link per external user:

```bash
npm run generate-launch-link -- --user external-bb-hotel-01 --email contact@their-domain.com
```

Send the `launch_url` from the output (email, WhatsApp, LinkedIn DM). Each person gets a **unique** `--user` id.

### With cohort directory (when live)

Promote the **Ludwitt/Hult app listing URL** from the platform directory.

---

## Phase 4 — Acquisition channels (target 30+ for buffer)

| Channel | Action | Target users |
|---------|--------|--------------|
| **Caribbean facilities network** | DM facility managers / sustainability leads (TT, JM, BB) with launch link + 1-line value prop | 10–15 |
| **LinkedIn** | Post: “Free Caribbean electricity baseline calculator — compare JPS/T&TEC/BLPC tariffs” + link to `/venture` materials | 5–10 |
| **Professional associations** | ASHRAE Caribbean, energy-efficiency WhatsApp groups (with permission) | 5–10 |
| **Personal network** | Ask 10 non-cohort contacts in Caribbean or diaspora to complete calculator honestly | 5–10 |
| **CEAL Green prospects** | Sanitized outreach (no CRM names in public repo) — audit-readiness demo | 3–5 |

### Message template (customize)

> Hi [Name] — I built a free Caribbean electricity calculator that estimates your bill baseline and audit readiness using public tariff data (Jamaica, Trinidad, Barbados, etc.). Would you try it for 3 minutes? Your feedback helps validate a Greenularity Caribbean™ demo: [launch_url]

---

## Phase 5 — User journey (what “done” looks like)

1. User opens **launch URL** → session cookie set
2. Redirected to `/calculator`
3. Enters jurisdiction, kWh/spend, loads → **Calculate**
4. Views results (audit readiness score + disclaimer)
5. App fires `calculator_completed` → Ludwitt receives `quiz_submitted`

Optional but not required for gate: lighting, equipment, monitor modules.

---

## Phase 6 — Snapshot & PR evidence

When `qualified_users >= 25` (aim for 30+):

```bash
npm run export-metrics
npm run generate-pr-body
```

Commit:

- `evidence/metrics-snapshot-YYYY-MM-DD.json`
- Updated `SUBMISSION_PR.md`

In the PR, state explicitly:

- **Metrics source:** Own reference API at `https://YOUR-API-HOST/v1` *(or cohort Ludwitt URL)*
- **Snapshot timestamp:** from JSON
- **Qualified count:** from JSON (not self-typed)
- **Launch method:** reference API launch tokens / platform directory

---

## Daily tracker (fill locally — do not commit PII)

| Day | Links sent | Completed (your notes) | Running qualified (from export-metrics) |
|-----|------------|------------------------|----------------------------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `qualified_users` stays 0 after real usage | Vercel `LUDWITT_API_BASE_URL` still localhost → deploy public API + redeploy |
| Smoke test OK but export shows 0 | Export reads different API than production — align `.env.local` with Vercel |
| Launch shows “Launch from Ludwitt/Hult” | JWT secret / app_id mismatch — re-register and sync Vercel env |
| User completed but not counted | They skipped launch URL; or user id contains `ryanroper79` |
| API restarted, count dropped | Re-run acquisition; keep API up until snapshot |

See also: [DEPLOY.md](./DEPLOY.md), [promotion-playbook.md](../../../../curriculum/phase-2/project-1-learning-app/promotion-playbook.md)
