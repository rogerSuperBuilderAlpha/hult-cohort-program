# Phase 2 Open Source Tracking — @r3s0lv343vr

**Craig Ferguson** (@r3s0lv343vr) · Hult Cohort Developer Program · Summer 2026 · Week 6 (`phase-2-open-source`)

## Upstream repo URL

https://github.com/rogerSuperBuilderAlpha/cursor-boston

## Upstream PR URL

https://github.com/rogerSuperBuilderAlpha/cursor-boston/pull/1711

## Merge status

**Merged** — merged 2026-08-22 by @rogerSuperBuilderAlpha into `develop`.

| Check | Status |
|-------|--------|
| PR state | **MERGED** |
| Merged at | 2026-08-22T18:17:40Z |
| Merged by | @rogerSuperBuilderAlpha |
| Review | **Approved** — collapsed nav names, Escape-to-close, slugged nav-group ids; tests cover the a11y behavior |
| CI — Lint, Test, E2E, DCO, REUSE, CodeQL | **Pass** |
| CI — Security Scanning | Fail (pre-existing `npm audit` — not introduced by this PR) |
| CI — Vercel | Fail (fork authorization — not a merge gate for `develop`) |
| Issue #1710 | **Closed** (closed with PR merge) |

## Contribution summary

Joined the Hult Summer 2026 OSS swarm on Cursor Boston (same qualified target as the rest of the cohort). Labeled starter issues were already merged or claimed, so this contribution audits `components/AppShell.tsx` against the beginner roadmap items **Keyboard Navigation Audit** and **Improve Mobile Navigation**.

The collapsed sidebar rendered icon-only links with no accessible name (Research uses a React-node label, so even `title` was missing). The mobile drawer set `aria-expanded` but not `aria-controls`, did not close on Escape, did not restore focus, and used an invalid `aria-controls` id for **Needs Work** (`nav-group-needs work`). The PR adds names for collapsed links, Escape-to-close with focus restore and body-scroll lock, a valid `#site-navigation` control relationship, slugged group ids, and matching `AppShell` tests.

## Cohort swarm PRs (classmate projects)

Additional upstream PRs opened on Summer 2026 classmate repos (docs/a11y/chore; all **open** as of 2026-08-21). `frankgomezdev/pm-frankgomezdev` is not public (404), so that contribution is on `ai-agent` instead.

| Classmate | Upstream repo | PR |
|-----------|---------------|-----|
| [@artira](https://github.com/artira) | [pm-artira](https://github.com/artira/pm-artira) | https://github.com/artira/pm-artira/pull/13 |
| [@arjun-singh2127](https://github.com/arjun-singh2127) | [helm](https://github.com/arjun-singh2127/helm) | https://github.com/arjun-singh2127/helm/pull/14 |
| [@celiciakitty-creator](https://github.com/celiciakitty-creator) | [LexLearn](https://github.com/celiciakitty-creator/LexLearn) | https://github.com/celiciakitty-creator/LexLearn/pull/1 |
| [@frankgomezdev](https://github.com/frankgomezdev) | [ai-agent](https://github.com/frankgomezdev/ai-agent) | https://github.com/frankgomezdev/ai-agent/pull/1 |
| [@DivyaPrakash04](https://github.com/DivyaPrakash04) | [ourvelocity](https://github.com/DivyaPrakash04/ourvelocity) | https://github.com/DivyaPrakash04/ourvelocity/pull/4 |
| [@joes9987](https://github.com/joes9987) | [pm-joes9987](https://github.com/joes9987/pm-joes9987) | https://github.com/joes9987/pm-joes9987/pull/10 |
| [@Josie-ctrl](https://github.com/Josie-ctrl) | [projectmanagament](https://github.com/Josie-ctrl/projectmanagament) | https://github.com/Josie-ctrl/projectmanagament/pull/2 |
| [@kiaracaesar5627](https://github.com/kiaracaesar5627) | [personal-portfolio-kc](https://github.com/kiaracaesar5627/personal-portfolio-kc) | https://github.com/kiaracaesar5627/personal-portfolio-kc/pull/1 |
| [@Lorra-V](https://github.com/Lorra-V) | [the-effective-facilitator](https://github.com/Lorra-V/the-effective-facilitator) | https://github.com/Lorra-V/the-effective-facilitator/pull/1 |

## Issue claimed

https://github.com/rogerSuperBuilderAlpha/cursor-boston/issues/1710

## Agent usage

- Research: Cohort tracking PRs, Cursor Boston CONTRIBUTING (fork → `develop`, DCO, claim-before-code), unclaimed vs already-merged starter issues, AppShell/mobile-nav audit.
- Dev: AppShell keyboard/a11y fix + tests; issue #1710; upstream PR #1711; classmate swarm PRs; this tracking packet.
- QA: `npx jest --config config/jest.config.js __tests__/components/AppShell.test.tsx` (19 passed); eslint clean on changed files; pre-commit `tsc --noEmit` + eslint.

## Test plan

- [x] Collapsed nav links (including Research) have accessible names
- [x] Open menu has `aria-controls="site-navigation"`
- [x] Escape closes the mobile drawer and restores focus to Open menu
- [x] Nav group ids are slugged (`nav-group-needs-work`)
- [x] Upstream PR targets `develop` with DCO sign-off
- [x] Upstream PR merged (cursor-boston#1711, 2026-08-22T18:17:40Z)

## Program page

https://site-nine-rouge-68.vercel.app/program/phase-2-open-source

## Deadline

Upstream merge required by **Sun Aug 23, 2026, 5:00 PM ET**.
