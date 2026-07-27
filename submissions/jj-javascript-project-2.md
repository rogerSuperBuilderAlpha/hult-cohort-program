# Project 2 Submission — @jj-javascript

**Justin Jimenez** · Hult Cohort Developer Program · Summer 2026 · Project 2 (Internal communications platform)

**Production URL:** https://archivist-blue.vercel.app  
**Repo:** https://github.com/jj-javascript/Archivist

## Summary

Archivist is an internal communications platform for the Hult Cohort with real-time chat and AI-powered daily archive summaries. The wedge is preserving institutional knowledge: messages stay searchable, and each day gets an auto-generated summary with key points so important context does not get buried in thread chaos.

## Production URL

https://archivist-blue.vercel.app

## PM platform integration notes

- **Shared identity:** GitHub OAuth via Supabase Auth. Sign in with the same GitHub account used for PM platform work so staff can verify email/handle match during review.
- **PM deep links:** Not implemented in v1 (no PM platform URL unfurling yet).
- **Integration path:** Supabase `profiles` table auto-created on signup; same auth provider pattern as other cohort builds for unification week.

## Feature checklist (v1 scope)

| Requirement | Status |
|-------------|--------|
| Real-time messaging | ✅ Supabase Realtime on `messages` table |
| Message persistence | ✅ Postgres via Supabase |
| Multi-user auth | ✅ GitHub OAuth |
| Public HTTPS | ✅ Vercel production |
| Daily archive summaries | ✅ `/api/summarize` + Archive tab |
| ≥3 channels / DMs / search / announcements | ❌ Deferred — v1 ships single `#general` channel + archive differentiator |

## Architecture summary

Next.js 16 App Router + TypeScript + Tailwind CSS on Vercel. Supabase handles auth, Postgres storage, and realtime subscriptions. OpenAI GPT-4o-mini generates daily summaries stored in `daily_archives`.

```
Browser -> Next.js (Vercel) -> Supabase (Auth + Postgres + Realtime)
                             -> OpenAI (daily summaries)
```

## Agent usage

- **Research:** `/office-hours` startup mode — problem framing, cohort submission requirements, architecture decisions
- **Design:** `/design-shotgun` wireframes; selected **Earth & Clay** palette and applied to UI
- **Development:** Cursor agent scaffolded Next.js app, Supabase schema, realtime chat, archive view, and summary API
- **Deploy:** Vercel CLI — linked project, env vars, production deploy
- **QA:** Verified production HTTPS, CSS/styling, Supabase connectivity, summarize API endpoint

## Setup steps verified on fresh clone

```bash
git clone https://github.com/jj-javascript/Archivist.git
cd Archivist
npm install
cp .env.example .env.local
# Fill in Supabase + OpenAI keys; run SQL schema from README
npm run dev
```

Configure Supabase Auth redirect URLs for production:
- Site URL: `https://archivist-blue.vercel.app`
- Redirect URLs: `https://archivist-blue.vercel.app/**`

## How to review

1. Open https://archivist-blue.vercel.app
2. Click **Sign in with GitHub** and complete OAuth
3. Post a message in `#general` — it should appear instantly (realtime)
4. Refresh — messages persist
5. Generate a summary: `curl -X POST https://archivist-blue.vercel.app/api/summarize -H "Content-Type: application/json" -d '{"channel_id":"general"}'`
6. Switch to **Archive** tab to view daily summaries

## Known limitations

- Single channel (`#general`) — no DMs, search, or announcements yet
- Summary generation is manual via API (no cron yet)
- GitHub OAuth requires Supabase redirect URL configured for production domain
- No PM platform deep links in v1

## Test plan

- [x] Production URL returns 200 over HTTPS
- [x] Tailwind Earth & Clay styling loads on production
- [x] Supabase API reachable from production
- [x] `/api/summarize` responds on production
- [ ] GitHub OAuth sign-in on production (requires Supabase redirect config)
- [ ] Real-time message between two tabs (reviewer, after auth)
