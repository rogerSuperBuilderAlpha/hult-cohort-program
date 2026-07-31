# Deployment — Vercel + Supabase

Use this checklist for local development and production. Never commit `.env.local` or service-role keys.

## 1. Supabase project setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Enable **Authentication → Providers → Email** (confirm email can stay on for production).
4. Under **Authentication → URL Configuration**, set:

| Setting | Local development | Production (Vercel) |
|---------|-------------------|---------------------|
| **Site URL** | `http://localhost:3000` | `https://YOUR-VERCEL-URL.vercel.app` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://YOUR-VERCEL-URL.vercel.app/auth/callback` |

Add both local and production URLs to **Redirect URLs** if you test in both environments.

5. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not the service role key)

## 2. Local environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm install
npm run dev
```

**Email confirmation on localhost:** open the link on the same machine where `npm run dev` is running. Phone browsers cannot reach `localhost`.

## 3. Vercel deployment

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. **Settings → Environment Variables** — add for Production (and Preview if desired):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` (anon key) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

3. Redeploy after saving env vars.
4. Update Supabase **Site URL** and **Redirect URLs** to match the live Vercel URL (step 1.4).
5. Verify:
   - Live site returns HTTP 200
   - Sign up → confirm email → log in → land on `/`
   - Create an initiative while logged in → row appears in Supabase **Table Editor → custom_initiatives**

## 4. Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Missing Supabase environment variables” | Add env vars locally or on Vercel; restart dev server / redeploy |
| “Email not confirmed” on login | Confirm via inbox link (on dev machine) or resend from login page |
| Confirmation link “can’t connect” | Link points to localhost — use same PC with dev server running, or use production URL |
| Data not in Supabase | Ensure `schema.sql` was run and you are signed in (logged-out mode uses localStorage only) |
| “Failed to fetch” / “fetch failed” on login | Open **`/api/health`** after deploy. If `configOk` is true but **`supabaseReachable` is false**, the server cannot reach Supabase — usually a **paused** project (Supabase Dashboard → **Restore project**) or wrong project URL. If `configOk` is false, fix env vars and **Redeploy** (enable **Preview + Production**). After env changes, redeploy **without build cache**. |
| Sign Out shows “Log in” while logged in | Hard refresh; check Vercel env matches Supabase project |

## 5. Fork workflow (no upstream main access)

You do **not** need permission to push to the program org's `main`. Push to **your fork** instead.

### One-command push

**CMD:**

```cmd
cd submissions\studmuffin01-project-1
scripts\push-to-fork.bat
```

**PowerShell:**

```powershell
cd submissions\studmuffin01-project-1
.\scripts\push-to-fork.ps1
```

This script:

- Adds remote `fork` → `https://github.com/Studmuffin01/hult-cohort-program.git`
- Creates branch `participants/summer26/phase-1-project-1/studmuffin01`
- Commits `submissions/studmuffin01-project-1` (`.env.local` stays local)
- Pushes to your fork

### Manual equivalent (CMD)

```cmd
cd C:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program
git remote add fork https://github.com/Studmuffin01/hult-cohort-program.git
git checkout -b participants/summer26/phase-1-project-1/studmuffin01
git add submissions/studmuffin01-project-1
git commit -m "INITIARA: Supabase auth and Phase A updates"
git push -u fork participants/summer26/phase-1-project-1/studmuffin01
```

### Vercel after push

1. **Add New Project** → import **`Studmuffin01/hult-cohort-program`**
2. **Production Branch:** `participants/summer26/phase-1-project-1/studmuffin01`
3. **Root Directory:** `submissions/studmuffin01-project-1`
4. Add env vars (section 3) and deploy

### Official submission

When the program asks for a PR, open one **from your fork branch → upstream** cohort repo. That is the submission — not a direct push to upstream `main`.

**Full PR targets, bookmark URL, and title:** see [SUBMISSION.md](./SUBMISSION.md).

Quick reference:

| | |
|---|---|
| Base repo | `rogerSuperBuilderAlpha/hult-cohort-program` |
| Base branch | `projects/summer26/phase-1-project-1` |
| Head repo | `Studmuffin01/hult-cohort-program` |
| Compare branch | `participants/summer26/phase-1-project-1/studmuffin01` |

Compare URL: https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/compare/projects/summer26/phase-1-project-1...Studmuffin01:participants/summer26/phase-1-project-1/studmuffin01

## 6. Production URL (this submission)

Use your Vercel **production domain**, not a branch preview URL.

| Use this | Avoid this |
|----------|------------|
| `https://initiara-rawle.vercel.app` | `https://initiara-git-participants-summer26phase-1-project-….vercel.app` |

Branch URLs contain `-git-` and the branch slug. They change if the branch is renamed and stop working when the branch is deleted. Production aliases stay valid for portfolio links.

**Find yours:** Vercel → project **initiara** → **Settings → Domains** → the domain marked **Production** (no branch label).

Document the stable URL in [README.md](./README.md) and your PR body:

```markdown
## Production URL

https://initiara-rawle.vercel.app
```

Also set **`NEXT_PUBLIC_SITE_URL`** on Vercel to the same stable URL and add it to Supabase **Authentication → URL Configuration** (Site URL + Redirect URLs). Redeploy after changing env vars.
