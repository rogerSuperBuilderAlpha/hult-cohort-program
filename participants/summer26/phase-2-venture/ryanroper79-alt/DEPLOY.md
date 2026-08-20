# Vercel deployment — cEAL Green Energy Auditor

## Ludwitt env fix (required for user metrics)

**Problem:** If Vercel `LUDWITT_API_BASE_URL` is `http://localhost:4000/v1`, production cannot POST events. `export-metrics` will show `qualified_users: 0` no matter how many people use the app.

**Hosted cohort API:** `https://api.ludwitt.hult/v1` is documented but **not DNS-live** for summer26. Use your **own deployed reference API** until the platform is available.

### Fix in 6 steps

1. **Deploy** `execution/ludwitt-hult-api` to Render/Railway/Fly (Dockerfile included). Note the public HTTPS host.
2. **Health check:** `curl https://YOUR-HOST/health` → `{"ok":true,"service":"ludwitt-hult-api"}`
3. **Local `.env.local`:**
   ```env
   LUDWITT_API_BASE_URL=https://YOUR-HOST/v1
   LUDWITT_DEVELOPER_KEY=prod_key_demo
   APP_PRODUCTION_URL=https://caribbeanenergyauditor.vercel.app
   ```
4. **Re-register** (new app credentials on the public API):
   ```bash
   npm run register-app
   ```
5. **Vercel → Production env** — update `LUDWITT_APP_ID`, `LUDWITT_JWT_SECRET`, `LUDWITT_API_KEY`, `LUDWITT_API_BASE_URL`, keep `LUDWITT_DEVELOPER_KEY=prod_key_demo`. Redeploy.
6. **Verify:**
   ```bash
   npm run smoke-test    # expect qualified_users >= 1
   npm run export-metrics
   ```

**Important:** Reference API events are **in-memory**. Do not restart the API between user acquisition and snapshot export.

Full acquisition playbook: [USER_ACQUISITION_CHECKLIST.md](./USER_ACQUISITION_CHECKLIST.md)

Generate per-user launch links (when directory is not live):

```bash
npm run generate-launch-link -- --user external-jm-facility-01 --email contact@example.com
```

---

## Important: domain check

`https://caribbeanenergyauditor.vercel.app` must serve **this app** (header: “cEAL Green · Energy Auditor”).
If you see a different product (e.g. “Building Energy Lens”), either:

1. Open that Vercel project → **Settings → General → Root Directory** →  
   `participants/summer26/phase-2-venture/ryanroper79-alt`, redeploy, or  
2. Create a **new** Vercel project from your fork with the root directory above and attach the domain.

---

## Vercel project settings

| Setting | Value |
|---------|--------|
| Repository | `ryanroper79-alt/hult-cohort-program` |
| Branch | `participants/summer26/phase-2-venture/ryanroper79-alt` |
| Root Directory | `participants/summer26/phase-2-venture/ryanroper79-alt` |
| Framework | Next.js (auto) |
| Build Command | `npm run build` |
| Install Command | `npm install` |

---

## Environment variables (Production)

Set these in **Vercel → Project → Settings → Environment Variables → Production**:

| Variable | Required | Where to get it | Notes |
|----------|----------|-----------------|-------|
| `LUDWITT_APP_ID` | Yes | `npm run register-app` output | **New** venture app — not the Bid Manager ID |
| `LUDWITT_JWT_SECRET` | Yes | Same registration response | Validates launch JWTs |
| `LUDWITT_API_KEY` | Yes | Same registration (`api_key`) | Used by server to POST events |
| `LUDWITT_API_BASE_URL` | Yes | Platform docs | Production: `https://api.ludwitt.hult/v1` — Sandbox: `https://sandbox.api.ludwitt.hult/v1` |
| `APP_PRODUCTION_URL` | Yes | Your deploy URL | `https://caribbeanenergyauditor.vercel.app` |
| `NEXT_PUBLIC_APP_VERSION` | Yes | App version | `1.0.0` |
| `LUDWITT_DEVELOPER_KEY` | Optional on Vercel | Cohort / platform admin | Only needed locally for `register-app` / `export-metrics` scripts — **do not** use instead of `LUDWITT_API_KEY` on Vercel |
| `CRM_WEBHOOK_URL` | Optional | Google Apps Script web app `/exec` URL | **Production CRM** — POSTs each lead to [EnergyAuditorStorage sheet](https://docs.google.com/spreadsheets/d/17F4OcnHXhMEotTYUOlkWw_RiW4WAFewk/edit). Deploy `scripts/google-apps-script/energy-auditor-crm.gs`. Test: `npm run test-crm-webhook`. |
| `CRM_DATA_PATH` | Optional | Default `data/crm/leads.jsonl` | Local or self-hosted JSONL store; run `npm run export-crm` to export. |

**Never** commit these to GitHub. Never paste them in the public submission PR.

---

## Local registration (run once per environment)

```bash
cd participants/summer26/phase-2-venture/ryanroper79-alt
cp .env.example .env.local
```

Edit `.env.local`:

```env
LUDWITT_API_BASE_URL=https://api.ludwitt.hult/v1
# or http://localhost:4000/v1 with execution/ludwitt-hult-api running
LUDWITT_DEVELOPER_KEY=<your cohort developer key>
APP_PRODUCTION_URL=https://caribbeanenergyauditor.vercel.app
NEXT_PUBLIC_APP_VERSION=1.0.0
```

Then:

```bash
npm run register-app
```

Copy the three values into Vercel (`LUDWITT_APP_ID`, `LUDWITT_API_KEY`, `LUDWITT_JWT_SECRET`) and redeploy.

---

## Smoke test

### Against production (after Vercel env + redeploy)

```bash
# .env.local must include registered LUDWITT_APP_ID and APP_PRODUCTION_URL=https://caribbeanenergyauditor.vercel.app
npm run smoke-test
```

Expected: session cookie `energy_auditor_session`, `auditReadinessScore` number, `metrics.qualified_users >= 1`.

### Against local stack

Terminal 1 — Ludwitt API:

```bash
cd execution/ludwitt-hult-api && npm run dev
```

Terminal 2 — Venture app:

```bash
cd participants/summer26/phase-2-venture/ryanroper79-alt
# .env.local: LUDWITT_API_BASE_URL=http://localhost:4000/v1, APP_PRODUCTION_URL=http://localhost:3000
npm run dev
```

Terminal 3:

```bash
npm run register-app   # if not done
npm run smoke-test
```

---

## Metrics export + PR body

After **≥30** external users complete the calculator via the **platform launcher**:

```bash
npm run export-metrics
npm run generate-pr-body
```

- Snapshot: `evidence/metrics-snapshot-YYYY-MM-DD.json`
- PR body draft: `SUBMISSION_PR.md` (updated in place)

Then commit evidence + open PR (do not merge until you approve).

---

## Deployment Protection

If smoke tests fail with `launch did not set session cookie`, or the homepage shows a **Vercel login/SSO page** instead of “cEAL Green · Energy Auditor”, disable Deployment Protection for production:

**ceal-green / energyauditor** → **Settings → Deployment Protection** → disable **Vercel Authentication** for Production (or add a bypass for automated tests).

Public users launching from Ludwitt must reach `/launch?token=…` without an SSO wall. Re-run `npm run smoke-test` after changing this setting.

See also `VERCEL_DOMAIN.md` for domain alias cleanup (remove typo `cribbeanenergyauditor.vercel.app`).

## Launch URL for platform listing

Register / list in Ludwitt directory:

**https://caribbeanenergyauditor.vercel.app/launch**

Promote the **platform directory listing**, not the raw URL, so users authenticate and count toward metrics.
