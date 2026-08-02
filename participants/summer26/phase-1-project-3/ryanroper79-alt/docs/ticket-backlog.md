# Ticket backlog — claim before you build

Issues labeled `good-first-issue` on GitHub are the live source of truth. This file mirrors starter tickets for agents and humans.

## How to claim

1. Find an open issue: https://github.com/ryanroper79-alt/hult-cohort-program/issues?q=label%3Agood-first-issue
2. Comment: `Claiming this — ETA [date]`
3. Open a PR referencing the issue number

---

## good-first-issue

### T-001 · Add your ledger entry

**Scope:** Add Week 3 row for your handle in `data/ledger.ts` with real `deployUrl` and `prUrl` if merged.

**Acceptance:** `/work` shows your entry; live verify chip is green or amber (not fabricated).

**Effort:** 15 min

---

### T-002 · Publish your profile

**Scope:** Add or edit your entry in `data/participants.ts` using the snippet on `/join`.

**Acceptance:** `/p/{your-handle}` returns 200; OG image renders in Slack/Discord.

**Effort:** 10 min

---

### T-003 · Fix a broken deploy link

**Scope:** One ledger entry with a red verify chip — confirm URL or mark `not-indexed`.

**Acceptance:** Chip turns green/amber or entry honestly marked unindexed.

**Effort:** 20 min

---

### T-004 · Changelog entry

**Scope:** Add a dated line to `data/changelog.ts` for a shipped improvement during review week.

**Acceptance:** `/changelog` renders the new entry.

**Effort:** 10 min

---

## maintainer-only

- Live verify rate limits and GitHub token rotation
- Vercel alias and production URL changes
- Updating featured Week 1/2 infrastructure cards after vote results
