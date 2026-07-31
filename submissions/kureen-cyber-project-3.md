# [Project 3] Submission — kureen-cyber

**Banterfolio** — vibe marketing / public showcase platform for the Hult Cohort Developer Program Summer Pilot 2026.

## Production URL

**https://banterfolio.vercel.app/**

- Build repo: https://github.com/kureen-cyber/Banterfolio (`main`)
- Partner-facing README: https://github.com/kureen-cyber/Banterfolio/blob/main/README.md
- Profiles surface: https://banterfolio.vercel.app/profiles
- Latest production deploy: aliased to https://banterfolio.vercel.app/ (redeployed 2026-07-31)

## Sample profile URLs

Self-serve creator profiles (no fixed signup quota gate before merge — roster grows as creators save profiles):

- https://banterfolio.vercel.app/profiles
- https://banterfolio.vercel.app/explore
- https://banterfolio.vercel.app/ (cohort dashboard narrative)

## Vibe / positioning notes

**One-liner:** Banterfolio puts cohort proof on display — weekly shipping story, creator profiles, AI captions, and a post scheduler for partners who want evidence, not hype.

**Tone:** Proof & Pulse — navy ink, bright cyan, pulse coral, sun accent. Energetic but inspectable.

**Audience:** Hiring partners evaluating Summer Pilot builders; secondary: public / Hult community.

**Differentiators:**
- Cohort dashboard narrating four weekly ships (sites → PM → comms → vibe marketing)
- Creator profiles with save progress + optional Supabase cloud sync for cross-device visibility
- AI caption generator + social post scheduler loop
- Site-wide focus music, light/dark theme, coding memes every 3 minutes (20s display)
- Supabase-ready auth scaffolding for Studio

## Partner-facing README

[`README.md`](https://github.com/kureen-cyber/Banterfolio/blob/main/README.md) in the build repo — overview, architecture, run steps, Supabase/OpenAI setup, production URL.

## Product summary

| Surface | Path |
|---------|------|
| Cohort dashboard | `/` |
| Creator profiles | `/profiles` |
| Explore projects | `/explore` |
| AI captions | `/captions` |
| Post scheduler | `/scheduler` |
| Settings (theme / music / memes) | `/settings` |
| Contact a creator | `/contact` |
| Studio | `/studio` |

## Baseline coverage

| Requirement | Implementation |
|-------------|----------------|
| Public homepage + narrative | Cohort dashboard with weekly sprint story (≥200 words across sections) |
| Student profiles | `/profiles` — display name, handle, tagline, video intro, project cards |
| Portfolio links | Per-project deploy/link fields + explore index |
| PM integration | Sprint timeline + project status narrative on dashboard (static cohort snapshot for Week 4; live PM API deferred to unification) |
| Partner section | Contact + Studio pathways; partner README in build repo |
| Request intro | `/contact` creator contact form (local persistence MVP; placement email wiring via env) |
| Privacy | Local drafts; public showcase pages require no login |
| SEO | Metadata on root layout |
| Deployment | Vercel HTTPS: https://banterfolio.vercel.app/ |

**Note:** No real cohort signup quota is required before merge — profiles are self-serve and do not block ballot eligibility on a fixed 30/30 enrollment count for this submission.

## Setup (fresh clone)

```bash
git clone https://github.com/kureen-cyber/Banterfolio.git
cd Banterfolio
npm install
cp .env.example .env.local
npm run dev
```

For cross-device profile sync: set Supabase env on Vercel and run `supabase/showcase-profiles.sql`.

## Validation

- `npx tsc --noEmit` / `npm run build`
- Production smoke: https://banterfolio.vercel.app/ , `/profiles`, `/explore`, `/captions`, `/scheduler`
- Redeploy verified aliased to https://banterfolio.vercel.app/

## Agent usage

- **Research:** Project 3 public-showcase curriculum, hiring-partner needs, peer Project 3 PR patterns
- **Dev:** Next.js App Router Banterfolio — dashboard, profiles, captions, scheduler, settings, Studio scaffolding, cloud profile sync, meme timing
- **QA:** Typecheck/build; Vercel production redeploy

## Known limitations

- Partner `/partners` hire fee page and placement-lead email webhook are thinner than full portal MVP (contact form + README cover the intro path for Week 4)
- PM status is a cohort sprint snapshot, not a live Forth API yet
- Roster is self-serve (no enforced signup quota before merge)
- OpenAI captions fall back to templates without `OPENAI_API_KEY`
- Cross-device profile text sync requires Supabase env on Vercel + `showcase_profiles` SQL; large local video data-URLs stay device-local until Storage is wired
