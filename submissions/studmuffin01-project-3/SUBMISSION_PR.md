# Project 3 PR draft

**Title:** `[Project 3] Submission — Studmuffin01`

**Head:** `participants/summer26/phase-1-project-3/studmuffin01`  
**Base:** `projects/summer26/phase-1-project-3`  
**Upstream:** `rogerSuperBuilderAlpha/hult-cohort-program`

---

## Summary

LIGHTHOUSE — public showcase platform for the Hult cohort (Phase 1 Project 3). Hiring-partner homepage (projects / developers / partners CTAs), project showcase pages, live activity feed, developer profiles with GitHub/deploy links, read-only PM status snapshot, partners page with request-intro, testimonials, and showcase RSVP. Signal/night visual identity (independent of Forth & Fireside).

Partner guide: `submissions/studmuffin01-project-3/PARTNERS.md`  
Reviewer guide: `submissions/studmuffin01-project-3/REVIEWER.md`

## Production URL

https://lighthouse-studmuffin01.vercel.app

## Sample profile URLs

Real cohort profiles (from merged submission PRs + public deploys):

- https://lighthouse-studmuffin01.vercel.app/developers/studmuffin01
- https://lighthouse-studmuffin01.vercel.app/developers/nikjain15
- https://lighthouse-studmuffin01.vercel.app/developers/lorra-v
- https://lighthouse-studmuffin01.vercel.app/developers/kiaracaesar5627
- https://lighthouse-studmuffin01.vercel.app/developers/solzco1
- https://lighthouse-studmuffin01.vercel.app/developers/arjun-singh2127
- https://lighthouse-studmuffin01.vercel.app/developers/celiciakitty-creator
- https://lighthouse-studmuffin01.vercel.app/developers/jiaxinaspenlin-dotcom
- https://lighthouse-studmuffin01.vercel.app/developers/r3s0lv343vr

Also:

- https://lighthouse-studmuffin01.vercel.app/developers/mayachen (sample data — badged)
- https://lighthouse-studmuffin01.vercel.app/developers/elise (private sample; directory placeholder)
- https://lighthouse-studmuffin01.vercel.app/projects/forth
- https://lighthouse-studmuffin01.vercel.app/projects/fireside
- https://lighthouse-studmuffin01.vercel.app/projects/lighthouse

## Setup steps verified on fresh clone

1. Clone fork branch `participants/summer26/phase-1-project-3/studmuffin01`
2. `cd submissions/studmuffin01-project-3`
3. Copy `.env.example` → `.env.local`
4. `npm install`
5. `npm run dev` → http://localhost:3000
6. `npm run lint` and `npm run build`

## Architecture summary

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Data:** Real cohort profiles + clearly badged sample roster/PM snapshot (no login on public pages)
- **Hosting:** Vercel (Root Directory: `submissions/studmuffin01-project-3`)
- **Forms:** `/api/request-intro`, `/api/rsvp` → placement lead log / email env

## Test plan

- [ ] Open https://lighthouse-studmuffin01.vercel.app → public showcase at `/` (optional `/signin` does not gate)
- [ ] Browse Developers + project pages; open sample profiles
- [ ] Partners → request intro (interest type)
- [ ] Live feed + Testimonials
- [ ] RSVP form
- [ ] `cd submissions/studmuffin01-project-3 && npm run build`
