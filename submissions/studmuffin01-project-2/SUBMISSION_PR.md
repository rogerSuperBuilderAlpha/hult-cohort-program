# Project 2 PR draft (match Project 1 / #181 style)

**Title:** `[Project 2] Submission — Studmuffin01`

**Head:** `participants/summer26/phase-1-project-2/studmuffin01`  
**Base:** `projects/summer26/phase-1-project-2`  
**Upstream:** `rogerSuperBuilderAlpha/hult-cohort-program`

---

## Summary

FIRESIDE — team collaboration platform for the Hult cohort (Phase 1 Project 2). Channels, DMs, group chats, threads, file sharing, message flags, and a heuristic Fireside AI coach — paired with Forth (Project 1 PM) via sidebar deep links and `/ticket Campaign | Ticket label`.

Reviewer guide: `submissions/studmuffin01-project-2/REVIEWER.md`

## Production URL

https://hult-cohort-program-henna.vercel.app

Use **Continue as guest** on `/signin` — no real credentials required.

## Setup steps verified on fresh clone

1. Clone fork branch `participants/summer26/phase-1-project-2/studmuffin01`
2. `cd submissions/studmuffin01-project-2`
3. Copy `.env.example` → `.env.local` (optional `NEXT_PUBLIC_FORTH_URL`)
4. `npm install`
5. `npm run dev` → http://localhost:3000
6. `npm run lint` and `npm run build`

## Architecture summary

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Persistence:** Browser `localStorage` demo workspace (`fireside-workspace-v3`); sign-in display name via `sessionStorage`
- **Hosting:** Vercel (Root Directory: `submissions/studmuffin01-project-2`)
- **PM integration:** Forth (`NEXT_PUBLIC_FORTH_URL`, default https://forth-bice.vercel.app) — Open Forth, View all tickets, `/ticket` / `/task` slash cards
- **Core modules:** Workspace sidebar, message pane + filters, threads, attachments, flags, group modals, Fireside AI

## Motivation / engagement design notes

- Cohort-oriented channels (`#reviews`, `#motivation`, `#at-risk`, `#help`)
- Message flags (action / urgent / important / unread / archived) for triage
- Fireside AI answers flag-based questions (“What needs action?”, “What’s urgent?”)
- Visual language aligned with Forth (parchment grid, forest chrome, hard shadows) for a unified Phase 1 stack

## Known limitations

- Demo auth / guest bypass only — not multi-user realtime
- Attachments stored as data URLs in localStorage (size limits; SVG blocked)
- Fireside AI is rule-based over flags, not a live LLM
- No automated test suite yet (lint + production build)

## Agent usage summary

AI agents (Cursor) assisted with scaffolding, Forth restyle/integration, accessibility/contrast fixes, codebase audit cleanup, storage hardening, and documentation. Implementation choices, manual testing, and production deploy were completed by the author.

## Test plan

- [ ] Open Production URL → Sign in → **Continue as guest**
- [ ] Browse channels; send a message; open a thread
- [ ] Attach a file; flag a message; ask Fireside AI “What needs action?”
- [ ] Sidebar **Open Forth** / **View all tickets**
- [ ] Composer: `/ticket Internal Communications | Demo ticket`
- [ ] `cd submissions/studmuffin01-project-2 && npm run build`
