# Project 2 Submission - @raven-dubgub

**Joshua Scotland** ┬À Hult Cohort Developer Program ┬À Summer 2026 ┬À Project 2 (Internal communications platform)

**Production URL:** https://comms-raven-dubgub.vercel.app  
**Repo:** https://github.com/RAVEN-dubgub/comms-raven-dubgub

## Summary

Production cohort comms layer to replace Discord bootstrap: public channels, 1:1 DMs, staff announcements, in-app notifications, keyword search, and PM deep links. Same email identity as the PM platform for grader email-match checks.

## Production URL

https://comms-raven-dubgub.vercel.app

## PM platform integration notes

- **Shared identity:** Sign up / log in with the **same email** used on https://pm-raven-dubgub.vercel.app (cohort email match requirement).
- **Deep links:** Set `PM_PLATFORM_URL=https://pm-raven-dubgub.vercel.app`. Pasted PM task/dashboard/project URLs unfurl as clickable chips in messages. Header includes "Open PM platform".
- **Winning stack awareness:** Forth is the cohort PM winner for operations; this build integrates with the author's PM deploy URL and keeps email parity for unification week.

## Feature checklist (requirements)

| Requirement | Shipped |
|-------------|---------|
| ÔëÑ3 channels (general, announcements, reviews) | Yes (seeded) |
| Create channels | Yes |
| Rename / archive via API | Yes |
| 1:1 DMs | Yes |
| Message persistence (Postgres) | Yes |
| Announcements admin-only post | Yes (`ADMIN` role) |
| Notifications (@mention + DM) | In-app |
| Search | Keyword search UI + API |
| Multi-user auth | Email/password JWT |
| Public HTTPS | Vercel |
| Real-time MVP | Polling every 4s (under 5s limit) |

## Architecture summary

Next.js 16 App Router + Prisma + PostgreSQL (Neon) + JWT httpOnly cookies. APIs: `/api/auth`, `/api/channels`, `/api/dms`, `/api/search`, `/api/notifications`, `/api/users`.

```
Browser -> Next.js (Vercel) -> Prisma -> Neon Postgres
              |
       JWT session (same email as PM)
```

## Agent usage

- Research: Hult Project 2 requirements + Forth contribution workflow
- Dev: Scaffolded and implemented `comms-raven-dubgub` with Cursor; Neon project + Vercel deploy via CLI
- QA: Production login smoke (200) for admin account; channels seeded (`general`, `announcements`, `reviews`)

## How to review

1. Open https://comms-raven-dubgub.vercel.app/signup
2. Register with your PM-platform email (or log in if already seeded)
3. Post in `#general`, open a DM, try search
4. `#announcements` posting is admin-only

## Known limitations

- Polling instead of websockets (meets Ôëñ5s MVP)
- In-app notifications only (no email SMTP yet)
- Channel rename/archive exposed via API; UI focuses on create + chat
- Not load-tested at 15 concurrent posters yet

## Test plan

- [x] Production URL returns login page (HTTP 200)
- [x] Admin login succeeds on production API
- [x] Channels seeded in Neon
- [ ] Peer signup + DM (reviewer)
- [ ] Member blocked from posting in announcements (reviewer)
