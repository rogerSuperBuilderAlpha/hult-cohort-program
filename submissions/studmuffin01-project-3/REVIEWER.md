# Lighthouse — reviewer guide

Phase 1 Project 3 · Public showcase platform

## Production

| Item | Value |
|------|--------|
| App | Lighthouse |
| Folder | `submissions/studmuffin01-project-3` |
| Branch (intended) | `participants/summer26/phase-1-project-3/studmuffin01` |
| Base | `projects/summer26/phase-1-project-3` |

Production URL: *(add after Vercel deploy)*

## Smoke test (no auth)

1. Open `/` — sign in or **Continue as guest** (no account) → `/home`
2. Open `/home` — brand **Lighthouse**, 3 CTAs, live feed, journey, narrative, PM snapshot
3. `/projects` and `/projects/forth` — Problem / Solution / Proof / Deploy
4. `/live` — cohort activity feed
5. `/developers` — search/filter; open `studmuffin01`
6. Confirm Why I’m Here, build log, project showcase; CTA → Partners (not inline form)
7. `/developers/elise` — private placeholder (directory only)
8. `/people` and `/people/studmuffin01` — redirect to `/developers…`
9. `/partners` — fee copy + interest type + submit test intro (server log)
10. `/testimonials` — quote list
11. `/rsvp` — submit test RSVP
12. Mobile width — Cohort Live bottom strip readable

## Rubric mapping (curriculum)

| Dimension | Where to look |
|-----------|----------------|
| Production readiness | Deploy HTTPS, LCP-friendly static pages, mobile layout |
| Core functionality | Profiles, portfolio links, PM snapshot, partners, intro form |
| Code quality | Typed Next.js app; no secrets in repo |
| Ecosystem thinking | Links to Forth/Fireside deploys; privacy opt-out |
| Credibility to employers | Partner narrative + PARTNERS.md + sample profiles |

## Known limitations

- Roster is a seed list (expand to full enrolled count as roster finalizes)
- Intro/RSVP notify via server `console` until email provider is wired
- PM data is a static snapshot file, not a live API yet
