# Conexus (lorra-v · Phase 1 Project 2)

Internal communications platform for the Hult Cohort Summer Pilot 2026.

**Source of truth:** [docs/PRD.md](docs/PRD.md)

## Agent rules

1. Implement only the current Phase A step; hard-stop and wait for go-ahead between phases.
2. Do not invent production URLs, metrics, credentials, or Forth contract details.
3. Match PRD §8 design tokens exactly — no generic theme substitution.
4. Split server-only secrets; never commit `.env.local`.
5. After each step: Playwright smoke + commit with a descriptive message.

## Layout

- `src/app` — App Router pages
- `src/components` — UI (AppShell, later message/composer)
- `src/lib/supabase` — browser + server clients
- `tests/` — Playwright smokes per step
