# Project 2 Submission — @rogersuperbuilderalpha

**Forth Tavern (Ye Olde Tavern)** — internal comms platform built on the Forth PM shell. Discord/Slack-style guild communications (halls, town-crier announcements, missives, council-chamber voice) integrated with the same Firebase Auth identity as Project 1.

Repository: https://github.com/godwinKamau/forth

Production URL: https://forth-bice.vercel.app

Staging URL: https://forth-git-staging-calvintrinhvan-2763s-projects.vercel.app/

## PM platform integration notes

- **Shared identity:** Google/GitHub Firebase Auth uses the same email/UID as the Forth PM platform — no separate user table.
- **Unified shell:** Comms lives inside `components/forth-app.tsx` alongside Quest Log, Realm Map, Chronicle, and Guild Hall; one signed-in workspace session.
- **Same guild model:** Owner/member roles from Forth authorize hall access, voice signaling, and announcement posting; comms data is stored in separate Firestore subcollections under `workspaces/{workspaceId}` (never in `data/current`).
- **Deep integration:** Collapsible “Ye Olde Tavern” rail under Active campaigns; unread badges roll up when sections collapse; voice persists across PM view switches because `VoiceMeshManager` is held at the app-shell level.

## Requirements coverage

| Requirement | Status |
|---|---|
| ≥ 3 public channels (create/rename/archive) | ✅ `#great-hall`, `#the-forge`, `#the-scriptorium` + create/archive |
| 1:1 and group DMs | ✅ Missives with participant-only Firestore rules |
| Message persistence (≥ 30 days) | ✅ Firestore subcollections; no auto-deletion |
| Operator-only announcements | ✅ Town Crier (`#town-crier`); enforced in UI + `firestore.rules` |
| Notifications (@mention / DM) | ✅ In-app unread badges + toast when conversation not open |
| Keyword search | ✅ Client-side over readable halls + own missives (1,000-msg window) |
| Shared PM email auth | ✅ Firebase Auth (Google/GitHub) |
| Public HTTPS deployment | ✅ Vercel production + staging |

**Differentiators:** WebRTC mesh voice (3 council chambers, STUN-only), emoji reactions (six fixed choices), help desk channel, @mention autocomplete.

## Architecture summary

Next.js 16 App Router + React 19 + TypeScript on Vercel; Firebase Auth + Cloud Firestore backend. The shell owns a single `View` state machine (`today` | `board` | `proof` | `settings` | `channel` | `dm`). Comms adapters in `lib/firebase/comms.ts` use per-document Firestore listeners; pure helpers in `lib/comms/`; WebRTC signaling through `channels/{voiceId}/voicePeers` + `signals` subcollections. Real-time messaging target < 2s delivery; concurrent posting validated via emulator load tests.

```
forth-entry.tsx (Auth)
    └── forth-app.tsx (View state + VoiceMeshManager ref)
            ├── lib/workspace.ts (PM reducer)
            ├── lib/firebase/comms.ts (channels, DMs, readMarkers, voice)
            └── components/comms/ (Tavern UI)
```

## Setup steps verified on fresh clone

```bash
cd comms-godwinkamau
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local   # Firebase web config
pnpm dev
```

Quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:rules`, `pnpm test:e2e:tavern`, `pnpm build`.

## Agent usage

Built and iterated using Cursor agents against `AGENTS.md`: PM domain in `lib/workspace.ts`, comms pure logic in `lib/comms/`, Firestore adapters in `lib/firebase/comms.ts`, view state in `forth-app.tsx` so voice survives navigation. Agents run deterministic checks (Vitest, Firestore rules emulator, Playwright tavern audit) before marking tickets complete.

## Known limitations

- **Voice mesh:** Peer-to-peer O(n²) mesh for ~2–8 peers; STUN only (no TURN/SFU); symmetric NAT may fail.
- **Search:** Client-side keyword filter over the most recent 1,000 messages per hall; no server-side full-text index.
- **Notifications:** In-app only — no push or email notifications.
- **Comms MVP gaps:** No file attachments, reply threads, or presence indicators.
- **Demo mode:** Signed-out localStorage demo hides the Tavern entirely (comms is cloud-only).
- **Concurrent saves:** Stale-tab conflict detection on PM data; automatic field-level merge remains future work.
