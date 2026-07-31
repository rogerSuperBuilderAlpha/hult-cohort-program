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

*(add after Vercel deploy)*

## Sample profile URLs

- `/developers/studmuffin01`
- `/developers/mayachen`
- `/developers/elise` (private; directory placeholder)
- `/projects/forth` · `/projects/fireside` · `/projects/lighthouse`

## Setup steps verified on fresh clone

1. Clone fork branch `participants/summer26/phase-1-project-3/studmuffin01`
2. `cd submissions/studmuffin01-project-3`
3. Copy `.env.example` → `.env.local`
4. `npm install`
5. `npm run dev` → http://localhost:3000
6. `npm run lint` and `npm run build`

## Architecture summary

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Data:** Seed roster + PM snapshot modules (no login on public pages)
- **Hosting:** Vercel (Root Directory: `submissions/studmuffin01-project-3`)
- **Forms:** `/api/request-intro`, `/api/rsvp` → placement lead log / email env

## Test plan

- [ ] Open Production URL → homepage narrative + PM snapshot
- [ ] Browse Developers + project pages; open sample profiles
- [ ] Partners → request intro (interest type)
- [ ] Live feed + Testimonials
- [ ] RSVP form
- [ ] `cd submissions/studmuffin01-project-3 && npm run build`
