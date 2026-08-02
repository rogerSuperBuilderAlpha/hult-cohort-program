# Reviewer guide — @ryanroper79-alt showcase

Phase 1 Project 3 · Public vibe marketing platform

## Production

| Item | Value |
|------|--------|
| App | CEAL Green Projects |
| Folder | `participants/summer26/phase-1-project-3/ryanroper79-alt` |
| Branch | `participants/summer26/phase-1-project-3/ryanroper79-alt` |
| Base | `projects/summer26/phase-1-project-3` |
| URL | https://cealgreen-projects.vercel.app |
| Build repo | [monorepo tree](https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/tree/participants/summer26/phase-1-project-3/ryanroper79-alt) |

## Smoke test (≤ 5 min, no auth)

1. `/` — CARICOM cohort hero, Ryan compact spotlight, solutions preview, vote CTA
2. `/work` — three-week ledger; confirm live verify chips (if `GITHUB_TOKEN` configured on deploy)
3. `/p/ryanroper79-alt` — featured builder, HBS credentials, partner CTA
4. `/p/studmuffin01` — **private opt-out placeholder**
5. `/builders` — directory; Ryan featured first with headshot
6. `/partners` — enquiry form, solutions, Calendly placeholder, RSVP link
7. `/partners/solutions` — six solution cards with briefing links
8. `/partners/readme` — rendered PARTNERS.md
9. `/rsvp` — submit test RSVP (server log or GitHub issue)
10. `/status` — CI badge + verify panel
11. `/vote` — pre-filled GitHub review issue template
12. Mobile width — sticky join bar readable

## Rubric mapping

| Dimension | Where to look |
|-----------|----------------|
| Production readiness | HTTPS deploy, CI workflow, smoke-test script |
| Core functionality | Profiles, ledger, partners form, RSVP, privacy opt-out |
| Code quality | Typed Next.js; roster split for client/server; no secrets in repo |
| Ecosystem thinking | Links to pm/comms/showcase evidence in ledger; verify API |
| Credibility to employers | Ryan R. Roper spotlight, PARTNERS.md, Caribbean advisor network |

## Vote

File issue title: `Review by @{your-handle}: @ryanroper79-alt`

Keep `Vote: up` in the body to upvote. Use [/vote](https://cealgreen-projects.vercel.app/vote) for pre-fill.

## Known limitations

- 11/30 roster seed (stubs OK; expand via `/join` PR flow)
- Forms notify via Resend/GitHub when env configured; else structured server log
- Calendly embed hidden until `NEXT_PUBLIC_CALENDLY_URL` set
