# AGENTS.md — Pulse (Project 3)

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (partner inquiries, optional activity feed)
- GitHub public events API (optional `GITHUB_TOKEN`)

## Fresh clone

1. `npm install`
2. Copy `.env.example` → `.env.local`
3. Run `supabase/schema.sql` in Supabase SQL editor
4. `npm run dev` → http://localhost:3000

## Validation

```bash
npm test
npm run build
```

## Architecture

- `lib/roster.ts` — static opt-in builder profiles
- `lib/pm-snapshot.ts` — Forth PM integration (live reachability + snapshot)
- `lib/github-activity.ts` — Live Pulse ticker data
- `app/api/request-intro/route.ts` — partner form → Supabase + placement email log
- `components/QuickConnectModal.tsx` — per-builder conversion drawer
- `components/ArchitectureInspector.tsx` — UI preview ↔ architecture toggle

## Security

- Never commit `.env.local` or service role keys
- `SUPABASE_SERVICE_ROLE_KEY` server-only
- Partner form validates handles against public roster

## Design

Dark-mode-first cyberpunk default; vibe easter egg cycles CSS variables via `data-vibe` on `<html>`.
