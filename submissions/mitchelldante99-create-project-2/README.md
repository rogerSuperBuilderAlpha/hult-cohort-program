# Hult Hub

Hult Hub is the internal communications platform for the Hult Cohort Developer Program Summer Pilot 2026. It is built with Next.js, Supabase, and Vercel-friendly server/browser clients.

participants/summer26/phase-1-project-2/mitchelldante99-create
## Stack
- Next.js 16
- React 19
- Supabase Auth, Postgres, RLS, and Realtime
- Vercel deployment

## Environment
Copy `.env.example` to `.env.local` and set:
An open-access community developer program—GitHub-native projects in a six-week Summer Pilot.

**Open source:** curriculum, governance docs, and platform code are published under the [MIT License](LICENSE). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## What it is

Participants in the cohort complete eight tracked deliverables on GitHub: peer review in Phase 1, external users and maintainers in the final sprint. The cohort platform tracks submissions, written reviews, and private votes.

## Start here

- **Live site:** https://site-nine-rouge-68.vercel.app/start — visual intro for newcomers
- **[execution/marketing/site/content/program.ts](execution/marketing/site/content/program.ts)** — project copy (source of truth for weeks)
- **[AGENTS.md](AGENTS.md)** — map for AI agents and contributors
- **[WORKPLAN.md](WORKPLAN.md)** · **[DEVPLAN.md](DEVPLAN.md)** — launch status and production checklist
- **Archive:** [docs/archive/PROPOSAL-evp-2026.md](docs/archive/PROPOSAL-evp-2026.md) (historical EVP proposal)

Program design docs are expanded; **backend:** Firebase (Firestore + Auth). See [execution/marketing/FIREBASE.md](execution/marketing/FIREBASE.md).

## Repository map

Every leaf file states what's decided and carries a `To flesh out` checklist — each one is a self-contained work unit.
main

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup
Run `supabase/migrations/001_hult_hub.sql` in the Supabase SQL Editor. The migration creates the production data model, cohort membership, RLS policies, signup trigger, seed spaces/channels, indexes, and Realtime publication entries.

## Theme
Hult Hub supports persistent Light and Dark modes. Use the sun/moon button in the top navigation. The preference is stored locally in the browser.

## Production
Deploy the Next.js app to Vercel and add the same two Supabase environment variables in the Vercel project settings.


## Hult Hub Database Compatibility

This build is compatible with the combined feature-permissions SQL supplied for the existing Hult Hub database. Do not rerun the original migration that attempts to recreate `is_channel_member(uuid, uuid)` with different input parameter names. The feature migration above does not modify that function.
