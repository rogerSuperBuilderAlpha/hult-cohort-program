# Conexus (lorra-v · Phase 1 Project 2)

Internal communications platform for the Hult Cohort Summer Pilot 2026.

**Source of truth:** [docs/PRD.md](docs/PRD.md)

## Agent rules

1. Phase A is complete. Phase B production URL: **https://conexus-rust.vercel.app** (do not invent alternates).
2. Do not invent production URLs, metrics, credentials, or Forth contract details.
3. Match PRD §8 design tokens exactly — no generic theme substitution.
4. Split server-only secrets; never commit `.env.local`.
5. **Single Supabase project** (dev + prod). Destructive scripts must require an explicit CLI `--confirm` flag — not an env-var gate (there is no separate “dev” project to check).
6. After each verified change: Playwright smoke when relevant + local commit; push only when asked.

## Layout

- `src/app` — App Router pages
- `src/components` — UI (AppShell, messaging, Forth cards, …)
- `src/lib/supabase` — browser + server clients
- `src/lib/forth` — PMAdapter + fixtures
- `tests/` — Playwright smokes per step
