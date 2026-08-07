# CEAL Green Bid Manager — build rules

## Architecture
- All scoring, matching and calculation logic lives in `src/lib/bidmanager/` as pure functions. No React, no database calls, no side effects, no fetch.
- Components and API routes call the engine. They never do arithmetic inline.
- Every pure function has a Vitest unit test before the UI that uses it.

## Configuration
- Qualification weights, band thresholds, rubric definitions, source registries and scoring criteria come from config tables in the database.
- Never hardcode a weight, threshold, benchmark or scoring constant anywhere in the codebase. If a value is needed and no config row exists, stop and surface it. Do not invent one.
- Every config row carries `source` and `last_reviewed`.

## Data integrity — highest priority
- AI-extracted content is always written with `human_verified = false`. No code path may set it true except an explicit user action in the UI.
- The Assembler may only emit a factual claim about CEAL Green that resolves to a specific evidence row with `verified_by` and `verified_at` set.
- If no verified evidence row exists for a claim, emit a literal `[GAP — requires input: <what is missing>]` marker. Never write around a gap.
- Final export is blocked while any `[GAP]` marker remains in the document.
- Generated text cites its evidence row ID inline.

## Tenancy
- Every query is scoped by `org_id`. Row-level security enforced at the database.
- No CEAL Green data may be added to seed files, fixtures, or the public deployment. Seed data comes only from public procurement notices.

## Deployments
- **Public instance** — Ludwitt-registered, multi-tenant, public tender seeds only.
- **CEAL instance** — separate deployment, separate database, unlisted. Real corporate data.

## Observability
- All platform events emit through `src/lib/ludwitt/events.ts`. Nowhere else.
- Every AI call logs prompt, model, and token usage to an audit table.
