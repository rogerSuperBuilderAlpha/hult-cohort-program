# Agent instructions — Hult Cohort Showcase

This file is for coding agents (Cursor, Copilot, etc.) working on the vibe marketing platform.

## Project

- **Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS
- **Deploy:** Vercel — root directory `participants/summer26/phase-1-project-3/ryanroper79-alt`
- **Production:** https://cealgreen-projects.vercel.app

## Non-negotiables

1. **Cohort-first.** No capital solicitation, payback figures, or investor cohort language on-site. One footer link to cealgreen.com for commercial work.
2. **Evidence-first.** Ledger entries must use real deploy/PR URLs or honest `not yet indexed` chips. Status chips on `/work` trace to `/api/verify`.
3. **No CEAL Green logo in the header.** Cohort mark only.
4. **Never commit secrets.** Use `.env.local` for tokens.

## Before every commit

```bash
npm run typecheck
npm run build
npm run smoke-test   # optional; against production URL
```

## Key files

| File | Purpose |
|------|---------|
| `data/ledger.ts` | Cross-cohort work index |
| `data/participants.ts` | Builder roster — extend via PR |
| `data/cohort.ts` | Positioning (maintainer-protected) |
| `lib/verify.ts` | Live GitHub + deploy health checks |
| `PARTNERS.md` | Rendered at `/partners/readme` |

## Claim-first workflow

1. Read `docs/ticket-backlog.md` or open GitHub issues labeled `good-first-issue`.
2. Comment "I'll take this" on the issue.
3. Branch from `participants/summer26/phase-1-project-3/ryanroper79-alt`.
4. Small focused diff; conventional commit message.

## Adding a profile

Paste the snippet from `/join` into `data/participants.ts`, run build, open PR. Do not fabricate other participants' personal details beyond public GitHub data.
