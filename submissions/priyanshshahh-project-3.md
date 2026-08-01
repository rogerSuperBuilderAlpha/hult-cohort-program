# Project 3 Submission — @priyanshshahh

**shiplog** — the Summer Pilot 2026 cohort's vibe marketing platform. Project 3.

## Production URL

https://shiplog-snowy.vercel.app

Build repo: https://github.com/priyanshshahh/shiplog

## Sample profile URLs

- https://shiplog-snowy.vercel.app/cohort/priyanshshahh
- https://shiplog-snowy.vercel.app/cohort/RamyaTolety
- https://shiplog-snowy.vercel.app/cohort/CodingWCal
- https://shiplog-snowy.vercel.app/cohort (full roster)

## Vibe / positioning notes

**One-liner:** shiplog treats the cohort's own submission process — merged PRs,
public review issues — as the marketing asset, instead of decorating over it.

**Tone:** terminal / GitHub-native. Near-black background, a single terminal-green
accent, monospace labels, a light grid backdrop. Deliberately calmer than a
gradient-heavy landing page — hover states reveal deploy/repo/PR links rather than
hiding the evidence behind a "learn more."

**Audience:** hiring partners evaluating Summer Pilot builders; secondary, the
cohort itself.

**Differentiators:** every roster entry links a real merged pull request (not a
claim); a `/status` page surfaces the author's own prior Project 1 (Keel, PM
platform) and Project 2 (Cohort Comms) deploys as evidence of a three-week shipping
streak; a homepage activity ticker replays real merge/open events (actual PR
`mergedAt` timestamps from this repo, not simulated); interactive tag filtering on
`/cohort`; `AnimatePresence`-driven 3D page-stack transitions; a liquid-glass nav
whose blur/opacity respond continuously to scroll depth; zero fabricated names,
metrics, or placeholder logos anywhere on the site.

## Partner-facing README

https://github.com/priyanshshahh/shiplog/blob/main/README.md

Also on-site: https://shiplog-snowy.vercel.app/partners

## Architecture summary

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 + Framer Motion.
Fully static/SSG — no backend, database, or auth, by design (ships reliably inside
the review window). Roster data in `src/data/roster.ts` is sourced from merged PR
bodies on this repo (#66, #161, #183–193), not invented.

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/priyanshshahh/shiplog.git
cd shiplog
npm install
npm run build   # verified clean: tsc --noEmit, eslint, next build all pass
npm run dev     # http://localhost:3000
```

## Known limitations

- Roster only profiles the 8 peers with a merged Project 3 PR plus the author;
  the rest of the 67-person cohort isn't individually profiled yet (placeholder
  data was avoided rather than fabricating names — the pass gate allows this while
  the roster is still filling).
- No self-serve profile claim flow — a static, verifiable dataset was prioritized
  over standing up new auth/backend infrastructure under a one-day deadline.

## Agent usage

- Research: read `AGENTS.md`, `content/program.ts`, and `governance/winner-selection.md`
  on this repo; pulled all 8 merged Project 3 PR bodies plus the author's own
  Project 1/2 PRs via the GitHub API to ground every data point in a real source
  before writing any code. Searched skills.sh (`npx skills find`) for relevant
  Next.js/animation/UI skills and installed `magic-ui` and `framer-motion-animator`.
  Reviewed real showcase-site patterns via `WebFetch` on buildnatively.com/showcase,
  developers.openai.com/showcase, and rapidnative.com/showcase (debut.msagent.ai is
  a pure client-rendered SPA with no server-side content and couldn't be inspected —
  browser automation was unavailable, locked by another running session).
- Dev: scaffolded and built the Next.js app end-to-end (roster/profile/partners/status
  pages, design system, animations) with Claude Code; iterated a second pass adding
  a real-event activity ticker, `AnimatePresence` 3D page transitions, a scroll-linked
  liquid-glass nav, real GitHub avatars, and interactive tag filtering.
- QA: `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean; production
  deploy smoke-tested via `curl` on all five routes (200 on each) and avatar URLs
  verified resolving. No in-browser visual QA was performed — flagging that
  explicitly rather than claiming a visual pass.

## Test plan

- [x] Production URL loads over HTTPS with no auth wall
- [x] Sample profile URLs open (`/cohort/priyanshshahh`, `/cohort/RamyaTolety`, `/cohort/CodingWCal`)
- [x] `/partners` and `/status` return 200
- [x] Fresh clone: `npm install && npm run build`
- [ ] Peer UI / credibility review
