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

Pulled from merged Phase 1 submission PRs + verified production URLs:

| Handle | Public deploys |
|--------|----------------|
| `studmuffin01` | Forth · Fireside · Lighthouse |
| `nikjain15` | Pulse · Rally · https://hallmark.vercel.app |
| `lorra-v` | Mission Control · Conexus · https://hult-cohort-program-one.vercel.app |
| `kiaracaesar5627` | https://pilot-hult-pm.vercel.app · https://pilot-hult-comms.vercel.app |
| `solzco1` | https://pulse-ten-theta.vercel.app |
| `arjun-singh2127` | https://good-vibes-zeta.vercel.app |
| `celiciakitty-creator` | https://cohort-in-bloom.vercel.app |
| `jiaxinaspenlin-dotcom` | https://signal-atlas-omega.vercel.app |
| `r3s0lv343vr` | https://nextmove-hult.vercel.app |

Sample / fictional directory fillers, testimonials, and industry partners are badged **Sample data** and cannot be selected for partner intros.

## Smoke test (no auth)

1. Open `/` — public showcase first: brand **Lighthouse**, 3 CTAs, seeded activity preview, journey, roster signal (real vs sample)
2. Optional `/signin` — demo identity / guest; redirects into the showcase (does not gate content)
3. `/home` — redirects to `/`
4. `/projects` and `/projects/forth` — Problem / Solution / Proof / Deploy
5. `/live` — **Sample data** badge; seeded feed (not live webhooks)
6. `/developers` — ≥9 real profiles without Sample badge; open a sample profile and confirm **no stranger social/repo links**
7. Confirm Why I’m Here, build log, project showcase on a real profile; CTA → Partners
8. `/developers/elise` — private placeholder (directory only; sample)
9. `/people` and `/people/studmuffin01` — redirect to `/developers…`
10. `/partners` — intro form lists only real public handles; sample partners badged
11. `/testimonials` — quotes badged as sample data
12. `/rsvp` — submit test RSVP
13. Mobile width — Cohort Live bottom strip readable (“Demo counters”)

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

## SEO smoke

- `/robots.txt` — allow public routes, disallow `/api/`, points at sitemap
- `/sitemap.xml` — home, developers, projects, partners, etc.
- Root `metadataBase` resolves OG/canonical URLs to the production site origin
