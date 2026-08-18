# AGENTS.md — Trailmark (Project 3 Showcase)

## Goal

Ship a production public marketing / showcase platform (**Trailmark**) for the
Hult Cohort Summer Pilot: profiles, deploy evidence, PM status integration,
partner narrative, intro requests, and showcase RSVP.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Env

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_PM_URL` (FlexiFlow)
- `NEXT_PUBLIC_COMMS_URL` (Huddle)
- Optional: `PLACEMENT_LEAD_EMAIL`, `RESEND_API_KEY`

Never commit `.env.local`.

## Key paths

- `src/lib/participants.ts` — roster + privacy flags
- `data/pm-status.json` — PM snapshot (ballot evidence)
- `src/lib/store.ts` — intro / RSVP store + notify
- `src/app/page.tsx` — public homepage narrative
- `src/app/people/[handle]/page.tsx` — profiles
- `src/app/partners/**` — partner surfaces
- `src/app/api/intro/route.ts` · `src/app/api/rsvp/route.ts`

## Conventions

- Public pages require no auth.
- Default profile visibility is opt-in; opt-out shows a private placeholder.
- Prefer Bunny Fonts / system stacks — avoid `next/font/google` at build time.
- Deep-link FlexiFlow + Huddle; keep the same cohort identity story across apps.

## Do not

- Reintroduce Supabase / `firebase-admin` into this package.
- Hardcode partner fees differently from `PARTNERS.md` / hiring-partners.md.
