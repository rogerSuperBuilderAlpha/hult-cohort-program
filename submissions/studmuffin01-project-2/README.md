# Fireside

**Team Collaboration Platform for the Hult cohort — paired with [Forth](https://forth-bice.vercel.app/)**

Fireside replaces Discord with focused team collaboration: topic channels, direct messages, async threads, and deep links into Forth (Project 1 PM / tickets).

## Features (MVP)

- **Channels** — `#general`, `#announcements`, `#reviews`, `#motivation`, `#at-risk`, `#help`
- **Direct messages** · **Group chats** · **File sharing** · **Message flags** · **Fireside AI** · **Threads**
- **Forth integration** — sidebar links + `/ticket Campaign | Ticket label` (also `/task …`)

## Quick start

```bash
cd submissions/studmuffin01-project-2
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Sign in**.

**Reviewers:** use **Continue as guest** — see [REVIEWER.md](./REVIEWER.md).

## Design

Visual language aligned with Forth: parchment grid background, forest-green chrome, serif headlines, monospace UI labels, hard borders and offset shadows.

## PM platform integration

| Touchpoint | Behavior |
|------------|----------|
| `NEXT_PUBLIC_FORTH_URL` | Base URL (default https://forth-bice.vercel.app) |
| Sidebar **Open Forth** | Opens Forth home |
| **View all tickets** | Deep link to `/tickets` |
| `/ticket … \| …` or `/task … \| …` | Posts message + Forth ticket card |

## Author

**Rawle Arneaud** · Hult Cohort Program · Phase 1 Project 2
