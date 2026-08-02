# Lighthouse — reviewer guide

Phase 1 Project 3 · Public showcase platform

## Production

| Item | Value |
|------|--------|
| App | Lighthouse |
| Folder | `submissions/studmuffin01-project-3` |
| Branch (intended) | `participants/summer26/phase-1-project-3/studmuffin01` |
| Base | `projects/summer26/phase-1-project-3` |

Production URL: https://lighthouse-studmuffin01.vercel.app

## Real cohort profiles (smoke these)

| Handle | Public deploys |
|--------|----------------|
| `studmuffin01` | Forth · Fireside · Lighthouse |
| `nikjain15` | https://pulsecohort.vercel.app · https://rally-nikjain15.vercel.app |
| `lorra-v` | https://mission-control-sandy-phi.vercel.app · https://conexus-rust.vercel.app |
| `kiaracaesar5627` | https://pilot-hult-pm.vercel.app · https://pilot-hult-comms.vercel.app |

Sample / fictional directory fillers, testimonials, and industry partners are badged **Sample data** and cannot be selected for partner intros.

## Smoke test (no auth)

1. Open `/` — sign in or **Continue as guest** (no account) → `/home`
2. Open `/home` — brand **Lighthouse**, 3 CTAs, activity feed, journey, narrative, PM snapshot (labeled demo)
3. `/projects` and `/projects/forth` — Problem / Solution / Proof / Deploy
4. `/live` — cohort activity feed (real profiles + project signals)
5. `/developers` — confirm ≥4 real profiles without Sample badge; open `studmuffin01`, `nikjain15`, `lorra-v`, `kiaracaesar5627`
6. Confirm Why I’m Here, build log, project showcase; CTA → Partners (not inline form)
7. `/developers/elise` — private placeholder (directory only; sample)
8. `/people` and `/people/studmuffin01` — redirect to `/developers…`
9. `/partners` — intro form lists only real public handles; sample partners badged
10. `/testimonials` — quotes badged as sample data
11. `/rsvp` — submit test RSVP
12. Mobile width — Cohort Live bottom strip readable

## Rubric mapping (curriculum)

| Dimension | Where to look |
|-----------|----------------|
| Production readiness | Deploy HTTPS, LCP-friendly static pages, mobile layout |
| Core functionality | Profiles, portfolio links, PM snapshot, partners, intro form |
| Code quality | Typed Next.js app; no secrets in repo |
| Ecosystem thinking | Links to Forth/Fireside + peer deploys; privacy opt-out |
| Credibility to employers | Real merged-submission profiles + clear sample-data badges |

## Known limitations

- Directory still includes sample profiles for UX density; they are badged and intro-blocked
- Intro/RSVP notify via server `console` until email provider is wired
- PM panel is an illustrative snapshot file, not a live Forth API
- Cohort Live intro/RSVP counters are session-local, not a backend sync
