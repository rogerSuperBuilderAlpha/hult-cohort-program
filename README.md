# Hult Hub

Hult Hub is the internal communications platform for the Hult Cohort Developer Program Summer Pilot 2026. It is built with Next.js, Supabase, and Vercel-friendly server/browser clients.

## Stack
- Next.js 16
- React 19
- Supabase Auth, Postgres, RLS, and Realtime
- Vercel deployment

## Environment
Copy `.env.example` to `.env.local` and set:

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
