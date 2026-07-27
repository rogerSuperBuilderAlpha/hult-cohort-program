# Project 2 Submission — @kperpignant

**BuddyWire** — AIM-inspired instant messenger for the Hult Cohort Summer Pilot 2026.

## Production URL

https://buddywire.vercel.app

Build repo: https://github.com/kperpignant/buddywire

## Summary

BuddyWire revives the classic AIM experience for cohort communications: **buddy list** with Online/Away/Offline presence, **IM windows** for 1:1 chat, **chat rooms** (`#general`, `#announcements`, `#reviews`), editable **away messages**, **screen names**, **@mentions**, in-app **notifications**, and **Find in Chats** search. Real-time delivery uses Firestore `onSnapshot` when Firebase is configured; a **demo mode** (localStorage) lets reviewers explore the full UI without OAuth.

Visual design: Win98-style chrome — blue gradient title bar, yellow buddy pane (`#FFF8DC`), beveled buttons, Tahoma/Verdana typography.

## PM platform integration notes

- **Winning PM:** [Forth](https://forth-bice.vercel.app) — source [CodingWCal/forth](https://github.com/CodingWCal/forth)
- **Shared identity:** Production uses **Firebase Auth (Google + GitHub)**; sign in with the **same email** you use on Forth. Demo mode skips auth for UI review.
- **Deep links:** Paste `https://forth-bice.vercel.app/?taskId={id}` in IM or chat rooms → renders an **Open Forth task** chip (`lib/forth-links.ts`).
- **Navigation:** **Open Forth** button in the title bar (`NEXT_PUBLIC_FORTH_BASE_URL`, default `https://forth-bice.vercel.app`).
- **Scope:** Link + identity only — Forth does not expose a confirmed public task API or outbound webhooks in v1; no bidirectional task sync claimed.

## Architecture summary

```
Browser (Next.js 16 App Router, AIM shell)
  ├── Demo adapter → localStorage (no Firebase env)
  └── Firebase adapter
        ├── Auth: Google + GitHub
        └── Firestore: users, rooms/{id}/messages, dms/{id}/messages, notifications
```

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 App Router + React 19 + TypeScript |
| Styling | Custom AIM/Win98 CSS (`app/globals.css`) |
| Auth | Firebase Auth (Google, GitHub) |
| Realtime | Firestore listeners |
| Hosting | Vercel → https://buddywire.vercel.app |

## Setup steps verified on fresh clone

```bash
git clone https://github.com/kperpignant/buddywire.git
cd buddywire
npm install
cp .env.example .env.local
npm test    # 5/5 smoke tests
npm run build
npm run dev # http://localhost:3000
```

**Demo path (no Firebase):** leave `.env.local` Firebase keys empty → click **Explore demo (no sign-in)**.

**Production Firebase:** enable Google + GitHub in Firebase Auth, create Firestore, copy Web App config to `.env.local`, deploy `firestore.rules`, add Vercel hostname to Auth authorized domains.

## Baseline coverage

| Requirement | Implementation |
|-------------|----------------|
| Channels (≥3; create/rename/archive) | `#general`, `#announcements`, `#reviews` + room admin UI |
| Direct messages | IM panel from buddy list |
| Message persistence | Firestore (prod) / localStorage demo (≥30-day capable) |
| Announcements | Staff-only `#announcements` |
| Notifications | In-app panel: @mention, DM |
| Search | Find in Chats tab |
| Multi-user auth | Firebase Auth; cohort-sized |
| Deployment | HTTPS production URL above |
| Real-time | Firestore `onSnapshot`; no manual refresh |

## Known limitations

- **Firebase optional for demo:** Production deploy ships demo mode when Firebase env vars are unset; multi-user realtime requires configuring Firebase on Vercel.
- **Forth unfurl:** Link chips only — no live task title/status from Forth API.
- **Typing indicator:** Local UI hint only (not multi-client synced in v1).
- **Sounds:** Door open/close toggle not shipped in v1 (off-by-default planned).
- **Mobile:** Desktop-first AIM layout; buddy list collapses on narrow viewports.

## Agent usage summary

- **Research:** Hult Project 2 requirements, Forth auth/integration model ([CodingWCal/forth](https://github.com/CodingWCal/forth)), peer submission patterns, AIM UX reference.
- **Dev:** Cursor Agent scaffolded BuddyWire — AIM shell, buddy list/presence, IM + rooms, away messages, Forth deep links, demo store, Firestore schema/rules, tests.
- **Deploy:** Vercel production deploy → https://buddywire.vercel.app (HTTP 200 verified).
- **QA:** `npm test` (5/5), `npm run build` green; production smoke (HTTPS 200, BuddyWire entry screen).
