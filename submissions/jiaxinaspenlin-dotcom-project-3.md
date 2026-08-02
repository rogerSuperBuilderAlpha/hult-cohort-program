## Summary
Signal Atlas is an interactive talent and project-discovery platform for the Hult Cohort Developer Program. Published participants appear as stars in a navigable universe, grouped into constellations by the mission they built for, and each profile opens as an individual star system.

It is built for recruiters, employers, mentors, collaborators, sponsors, and other potential partners.

Two rules run through the whole product:
- Nothing is public until an administrator reviews and publishes it.
- Nothing is scored or ranked. There is no ranking model, overall rating, or hidden weighting in the product or database.

## Production URL
https://signal-atlas-omega.vercel.app

## Application repository
https://github.com/jiaxinaspenlin-dotcom/signal-atlas

## Public API
https://signal-atlas-omega.vercel.app/api/v1  

## Sample profile URLs
1. https://signal-atlas-omega.vercel.app/builders/jiaxinaspenlin — real participant
2. https://signal-atlas-omega.vercel.app/builders/demo-mira-adeyemi — demo profile
3. https://signal-atlas-omega.vercel.app/builders/demo-rin-okafor — demo profile
4. https://signal-atlas-omega.vercel.app/builders/demo-sena-varga — demo profile
5. https://signal-atlas-omega.vercel.app/builders/demo-tomas-brekke — demo profile

Five profiles are published: one real participant and four demo profiles. The demo profiles are fictional and exist so the platform can be seen with a populated cohort while the real cohort is still onboarding. Each carries a visible "Demo profile — not a real cohort member" badge on the profile page, in the directory, and in the star map, and is flagged `isDemo` in the public API so it can be filtered out programmatically.

## Vibe / positioning notes
Signal Atlas turns a conventional cohort directory into a navigable talent universe.

The homepage is the **Cohort Control Center**. Published participants appear as stars grouped into constellations by mission. A star's position indicates which brief the participant answered and does not represent quality or rank. A line between two stars means those participants contributed to the same project.

Every star uses the same visual treatment. Size, brightness, and color do not encode quality because Signal Atlas does not assign participants a quality score. The map explicitly explains that position represents the brief completed, never a ranking.

Missions organize the platform. Cohort missions represent weekly briefs, while independent work can appear under a participant-created mission. Mission pages show the brief followed by each participant's project, allowing visitors to compare how different builders approached the same problem.

**Universe View** provides the immersive visual experience. **List View** is a complete, searchable, keyboard-accessible, and mobile-friendly equivalent. Each star is implemented as a focusable button with a full accessible name, no essential content exists only inside a canvas, and motion respects `prefers-reduced-motion`.

The **Talent Scanner** helps recruiters and partners discover builders by skill, signal, industry, role, and availability. Each result explains which selected criteria matched and which did not — scanning for Python, for example, returns two builders under "Meets every criterion", each annotated "Lists Python as a core skill". There is no hidden weighting or proprietary score.

The visual direction combines NASA mission control with a polished technology publication: a dark deep-space environment, restrained motion, deliberate typography, and clear plain-language orientation.

Aspen's public profile currently features:
- **Ember** — a multi-tenant cohort communications platform where conversations turn into action. It addresses important discussions becoming buried without clear ownership by connecting channels, threads, and announcements to tasks, decision logs, and help requests. Built for the Week 2 cohort mission.
- **Grow Sprout** — a project-management platform for student builders, built for the Week 1 cohort mission. It addresses momentum loss when tasks, deadlines, blockers, feedback, and GitHub activity are scattered across disconnected tools.

Both projects link to a live deployment and public repository.

Published records are also available as JSON at `/api/v1`, documented by `/api/v1/openapi.json`, with a JSON Feed at `/feed.json`. No API key is required, and unpublished records are excluded.

## Partner-facing README
[`docs/PARTNERS.md`](https://github.com/jiaxinaspenlin-dotcom/signal-atlas/blob/main/docs/PARTNERS.md)

The partner-facing documentation explains how recruiters, employers, mentors, sponsors, and collaborators can:
- explore cohort talent
- review project write-ups
- propose technical challenges
- sponsor work
- offer mentorship
- recruit participants
- invite builders to present demonstrations
- use the public JSON API

The two partner enquiry forms on `/partners` submit directly to the in-platform admin queue.

## Agent usage

An AI coding assistant was used throughout, under direction.

- **Research:** recruiter and partner needs, cohort-directory positioning, the accessibility and privacy implications of a visual-first directory, participant onboarding, and ways to present talent without introducing ranking. Also for reading the shipped Next.js 16 documentation directly, which surfaced that `middleware.ts` is deprecated in favor of `proxy.ts` — a breaking change too recent to be assumed.

- **Dev:** architecture and data-model design, debugging, authentication and authorization, the publication state machine, constellation-layout calculations, documentation, and deployment. Product decisions, profile content, privacy choices, and every external action — pushing, deploying, provisioning the database — were made and carried out by me.

## Test plan
- [x] Production homepage loads over HTTPS
- [x] Five sample profile URLs load
- [x] Aspen's profile displays Ember and Grow Sprout
- [x] Aspen's profile does not display Unmapped
- [x] Demo profiles are clearly labelled as demo profiles
- [x] Builder directory and List View work
- [x] Universe View is keyboard accessible
- [x] Talent Scanner explains its matches
- [x] Mission pages and external project links work
- [x] Partner page and partner-facing README are available
- [x] Unpublished profiles and projects remain private
- [x] Mobile layout works
- [x] Reduced-motion behavior works
- [x] Type checking passes
- [x] Linting passes
- [x] Automated tests pass
- [x] Production build passes
- [x] Database validation passes
- [x] Secret scan passes

Verified on 2 August 2026 against commit `a1a3944` and the live deployment.

| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm test` | 488 passed |
| `npm run test:e2e` | 186 passed, 1 skipped |
| `npm run build` | compiled successfully |
| `npm run db:validate` | pass, no drift |
| Secret scan of tracked files | clean |

End-to-end coverage ran across desktop Chromium, mobile Safari, JavaScript-disabled, and reduced-motion configurations, with axe-core accessibility assertions.

Every public route was checked live over HTTPS and returned HTTP 200 with HSTS and a nonce-based Content Security Policy present: the homepage, the builder directory in both List and Universe views, all five published profiles, all three mission pages, all four project pages, `/talent-scanner`, `/partners`, `/api/v1`, `/api/v1/openapi.json`, `/feed.json`, `/sitemap.xml`, and `/robots.txt`. Both of Aspen's projects link out to a live deployment and a public repository, and all four external links returned 200.
