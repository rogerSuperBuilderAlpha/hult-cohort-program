# AGENTS.md — Admissions take-home

Parent guide: [../../AGENTS.md](../../AGENTS.md)

## Purpose

Public **"fix the repo"** task for applicants. Broken Express task board — candidates open a PR with fixes. Published separately; this copy lives in the monorepo for CI and docs.

**Public repo:** `NEXT_PUBLIC_TAKE_HOME_REPO_URL` in site env (see site `.env.example`).

## Commands

```bash
npm install
npm test
npm run test:ci    # verify-starter.js — used in CI
npm run dev
```

## Key files

| File | Role |
|------|------|
| `src/index.js` | Express app (intentionally buggy starter) |
| `tests/` | Test suite applicants must make pass |
| `scripts/verify-starter.js` | CI guard — starter must stay 1 pass / 3 fail |

## Conventions

- Do **not** fix all bugs in the starter — applicants need failing tests to fix
- `test:ci` enforces starter difficulty; coordinate with admissions workflow
- ESM, Node 24 in CI

## Related

- Site apply flow: [../marketing/site/app/apply/](../marketing/site/app/apply/)
- Admissions ops: [../../operations/admissions.md](../../operations/admissions.md)
