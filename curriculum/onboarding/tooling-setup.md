# Tooling setup

**Purpose:** Pre-cohort and week-1 checklist so every student arrives with working Cursor, Claude Code, GitHub, and deployment accounts before Project 1 kickoff (week 2).

---

## Required subscriptions and cost

| Tool | Cost | Required |
|------|------|----------|
| Cursor Pro (or Business) | $200/month | Yes |
| Claude Code (Max tier) | $200/month | Yes |
| GitHub | Free | Yes |
| Vercel (Hobby or Pro) | $0–$20/month | Yes — recommended deploy target |
| Domain (optional) | ~$12/year | Optional for Project 1 |

**Total student tooling:** **$400/month** × ~4 months = **~$1,600 per semester** (disclosed in admissions).

Subsidies for need-based students start cohort 2 ([business/subsidies.md](../../business/subsidies.md)). Cohort 1: no exceptions without EVP approval.

### Can't afford subscriptions (cohort 1)

1. Student flags on application → program director review
2. Options: (a) defer to next cohort when subsidies may exist, (b) sponsor pays, (c) ⚠️ EVP one-off hardship grant
3. **No enrollment without both active subscriptions by week 1 Tuesday**

---

## Pre-cohort prep (complete before Sep 8, 2026)

Sent to admitted students **September 1** in the Pre-Cohort Setup email.

### Step 1: GitHub (30 min)

1. Confirm GitHub account ≥ 6 months old with ≥ 5 commits
2. Enable **2FA** (required for org access)
3. Set profile: real name, photo, location, link to LinkedIn optional
4. Accept cohort org invite (sent week 1 Monday morning)

### Step 2: Cursor (45 min)

1. Download from cursor.com — macOS or Linux strongly preferred; Windows WSL2 acceptable
2. Subscribe to **Pro** ($20/mo) minimum; **$200/mo tier** required per program policy — confirm plan matches
3. Sign in with GitHub
4. Install recommended extensions: ESLint, Prettier, GitLens
5. Verify: open a repo, run Agent on a simple task, confirm it edits files

### Step 3: Claude Code (45 min)

1. Subscribe at claude.ai / Anthropic console — **Max** tier ($200/mo)
2. Install Claude Code CLI per official docs
3. Authenticate terminal session
4. Verify: run `claude` in a test repo, complete one small task

### Step 4: Vercel (20 min)

1. Create account, sign in with GitHub
2. Link GitHub for deploy-on-push
3. Deploy the admissions take-home repo or a hello-world app
4. Confirm public URL loads

### Step 5: Local machine spec

| Requirement | Minimum |
|-------------|---------|
| RAM | 16 GB |
| Storage | 20 GB free |
| OS | macOS 13+, Ubuntu 22.04+, or Windows 11 + WSL2 |
| Network | Stable broadband; no VPN blocking GitHub/Vercel |

---

## Week 1 verification checkpoint

**Friday week 1, 14:00** — students post in `#setup-verification` (cohort comms — interim Discord, see [cohort-tooling.md](../../operations/cohort-tooling.md)):

```
GitHub: @username (2FA on)
Cursor: screenshot of active subscription
Claude Code: screenshot of CLI session
Vercel: URL of deployed test app
```

Program staff spot-checks 100% before week 2 kickoff. Missing setup = cannot start Project 1 (may withdraw for week-1 refund until Friday 17:00).

---

## Deployment stack guidance

**Recommendation:** **Vercel as recommended default; not mandatory.**

| Layer | Policy |
|-------|--------|
| Hosting | Student choice; Vercel documented in week 1 workshop because it pairs with GitHub and agents well |
| Database | Student choice; Supabase/Neon/Vercel Postgres documented as defaults |
| Auth | Student choice |
| Stack | **No language/framework requirement** — build in whatever ships fastest |

Builds must be **production-deployed at a public HTTPS URL** for review eligibility. localhost does not qualify.

---

## Program-provided vs student-provided

| Provided by program | Provided by student |
|---------------------|---------------------|
| GitHub org membership | Laptop |
| Org-level repo templates | Cursor subscription |
| Shared `.github/ISSUE_TEMPLATE` and `PULL_REQUEST_TEMPLATE` | Claude Code subscription |
| Deployment workshop (week 1) | Vercel account |
| | Domain (optional) |

Program never pays student tooling in cohort 1.

---

## Open decisions

| Item | Who decides |
|------|-------------|
| Hardship subscription grants cohort 1 | EVP |

## Depends on

- [business/subsidies.md](../../business/subsidies.md)
- [operations/admissions.md](../../operations/admissions.md)
- [operations/cohort-tooling.md](../../operations/cohort-tooling.md)
