# Agent instructions — Climate Builder Network

- **Stack:** Next.js 15, TypeScript, Tailwind
- **Production:** https://cealgreen-projects.vercel.app
- **Scope freeze:** No marketplace, ratings, per-person scores, commercial/pricing/investment copy, or labeling participants as "Builders".

## Before commit

```bash
npm run typecheck && npm run build && npm run smoke-test
```

## Key files

| File | Purpose |
|------|---------|
| `data/roster.ts` | Participant roster + `availableForEngagement` |
| `data/ledger.ts` | Work index |
| `lib/artifact-check.ts` | Cached deploy URL scorecards |
| `PARTNERS.md` | Rendered at `/partners/readme` |

Participants edit `data/roster.ts` via `/join` — never preset `availableForEngagement` for others.
