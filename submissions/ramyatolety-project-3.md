# Project 3 Submission — @ramyatolety

**Lighthouse** — the cohort's vibe marketing platform. Summer Pilot 2026, Project 3.

## Production URL

https://lighthouse-ramyatolety.vercel.app

Build repo: https://github.com/RamyaTolety/lighthouse-ramyatolety

## Summary

Where Waypoint (Project 1) is a ship charting its own course and Beacon (Project 2) is a signal
fire on the ridge, **Lighthouse** is what guides partners into harbor and illuminates every crew's
finished voyages — a public, clickable directory of every participant, every shipped project, and
where to see it live.

Three things this platform does deliberately, not just descriptively:

1. **It auto-updates with zero sync job.** `src/lib/cohortSubmissions.ts` fetches and parses this
   very `submissions/` directory straight from the GitHub Contents API on every request, cached via
   Next.js ISR (`revalidate: 3600`). A new merged submission shows up here within the hour with no
   manual step, no cron, and no duplicated data store — Next's own cache does the "automatic" part.
2. **Every profile is click-through to real evidence**, not a claim. Each project card links both
   the production URL and the repo; a submission this parser can't fully make sense of (the
   directory mixes file- and folder-style entries with inconsistent field labels) still renders a
   card with a "View submission on GitHub" fallback instead of breaking.
3. **Participants can extend their own page.** GitHub sign-in claims the profile matching your
   handle (captured once from GitHub's own OAuth response, immutable after) and lets you add a bio
   and any project Lighthouse didn't auto-pull, layered on top of the auto-pulled data in Firestore
   — the auto-pulled and self-added halves coexist rather than one replacing the other.

## Sample profile URLs

- https://lighthouse-ramyatolety.vercel.app/p/CodingWCal
- https://lighthouse-ramyatolety.vercel.app/p/priyanshshahh
- https://lighthouse-ramyatolety.vercel.app/p/ramyatolety

## Vibe / positioning notes

The visual language is a dusk-navy background with a single warm amber "beam" accent — a slow
CSS sweep is the hero's one motion signature, not a wall of animation. It's deliberately calmer
than a typical marketing site: the cohort's actual shipped work is the energy, not decoration on
top of it. Copy throughout treats partners as people evaluating real production software, not
prospects being pitched — "click through to any profile for live deployments, repos, and what
each person has added themselves," not superlatives.

## Partner-facing README

The in-app `/partners` page is the partner-facing narrative and call to engage:
https://lighthouse-ramyatolety.vercel.app/partners

Source: [`src/app/partners/page.tsx`](https://github.com/RamyaTolety/lighthouse-ramyatolety/blob/main/src/app/partners/page.tsx)
in the build repo.

## Architecture summary

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth:** Firebase Authentication, GitHub sign-in only — the whole site is keyed on GitHub
  handles, so it's the one provider that can actually claim/edit a profile.
- **Data:**
  - Auto-pulled cohort data is never stored — parsed fresh from the GitHub Contents API on each
    request, cached via ISR.
  - `profiles/{uid}` (handle, bio, links) and `profiles/{uid}/customProjects/{id}` in Firestore —
    both public-read, write-restricted to the owning uid, with `handle` immutable after creation.
- **Hosting:** Vercel

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/RamyaTolety/lighthouse-ramyatolety.git
cd lighthouse-ramyatolety
npm install
cp .env.local.example .env.local   # then paste in a Firebase web app config
npm run dev                        # http://localhost:3000
```

Full Firebase console steps (enabling GitHub sign-in, publishing Firestore rules) are in the
repo's `README.md`.

## Known limitations

- **Submission parsing is best-effort.** The source directory mixes file- and directory-style
  entries with inconsistent field labels; anything this parser can't confidently extract a title
  from falls back to a generic "Project N Submission" label or a bare GitHub link rather than
  guessing wrong.
- **Profile-handle matching is case-sensitive against the URL** — `/p/CodingWCal` and
  `/p/codingwcal` are different routes. Claiming stores whatever casing GitHub returns at sign-in.
- **No admin moderation** on self-added project entries — same trust model as the rest of the
  cohort's tools.
