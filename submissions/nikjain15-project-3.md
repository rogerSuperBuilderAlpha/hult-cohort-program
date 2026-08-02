# Project 3 Submission — @nikjain15

**Hallmark** — the Summer Pilot 2026 cohort, independently assayed.

## Production URL

https://hallmark-eta.vercel.app

Build repo: https://github.com/nikjain15/hallmark

## Sample profile URLs

- https://hallmark-eta.vercel.app/cohort — the full roster (32 builders, alphabetical)
- https://hallmark-eta.vercel.app/builder/artira — a certificate with all four marks struck
- https://hallmark-eta.vercel.app/builder/alaskalam — a certificate with a partial row, showing "not yet" and "not checked" rendered distinctly
- https://hallmark-eta.vercel.app/builder/nikjain15
- https://hallmark-eta.vercel.app/builder/priyanshshahh
- https://hallmark-eta.vercel.app/method — the published standard, every check specified with its known false negatives
- https://hallmark-eta.vercel.app/partners — how to read the mark, and what it does not mean
- https://hallmark-eta.vercel.app/builder/artira/opengraph-image — the shareable certificate card (1200×630 PNG, generated per builder)

## Vibe / positioning notes

**One-liner:** An independent assay office for the cohort — four automated checks, run identically for every builder, with the checking code published and the limits stated as loudly as the marks.

**The device.** A British hallmark is a row of punches struck into silver by an assay office with no stake in the sale; you read the row and trust the metal without re-testing it. Hallmark punches the same way — `ship · live · docs · open` — and that row is the entire brand: it is the hero of the landing page, sits on every roster card, and is struck large on each certificate.

**Tone.** Assay office, not showcase. Warm paper and brass, serif for human claims, monospace for anything a machine verified — the typography itself tells you which statements were checked. Dark mode is the default in most feeds and was designed for, not inherited.

**Audience.** Builders first — the moment you have just shipped and want to post it without writing a humblebrag. Hiring partners second, reading the same evidence.

**Why not "proof".** Three Project 3 submissions merged before this one already lead on that word (shiplog: "proof of work, not a portfolio"; banterfolio: "cohort proof on display"; pixie dust cheesecake: "plates cohort proof"), and signal-atlas has taken "signal". Evidence-for-partners was a saturated axis before I started. Hallmark occupies **measurement** instead: not *that* someone shipped, but a published standard applied identically, whose failure modes are documented.

**Differentiators:**

- **Nothing is self-reported, and nothing is hand-entered.** Every fact is pulled from the GitHub API at build time — merged PRs across all three project branches, production URLs, repos, positioning lines, avatars. No database, no accounts, no forms, no write path anywhere. A builder appears the moment their PR merges, having done nothing.
- **Three mark states, not two.** `struck` / `not yet` / **`unknown`**. A check that could not run (timeout, cold start, bot filter) renders dashed with `?` and is labelled "not checked" — never as a failure. Publishing "their site is down" when the truth is "our probe timed out" would be a false claim about a named peer, so the distinction is enforced at the type level.
- **No rankings, ever.** Alphabetical only, no sort-by-score, with the reason in a code comment so it survives refactoring. Ranking peers who are simultaneously reviewing this submission would be self-serving. The game layer is capped at *earn and display, never compare*.
- **The limits are published in the same type size as the marks.** `/method` lists every check's known false negatives; `/partners` states plainly that a mark is not a quality score, not a ranking, and not an endorsement.
- **A GitHub-native correction path.** Every certificate carries "a mark wrong? tell us" — two clicks to a pre-filled issue containing all four marks and their evidence. No form, no account, no stored data.
- **Shareable certificate card** per builder, generated as a real OG image so posting the link renders it automatically. Punch glyphs are drawn as shapes rather than typed, so there is no font dependency.
- **We grade ourselves hardest.** `/method` publishes this project's own Build OS scorecard — 89/100, weak pillars included, with the arithmetic written out.

**Accessibility:** marks are never colour-only (visible label + `aria-label` stating the verified fact); skip link; visible focus; WCAG AA contrast in both themes; `prefers-reduced-motion` respected; single column at 375px.

**Honest limitations.** No automated end-to-end test — route health is checked by hand. Parser tests are written from real PR-body shapes rather than a versioned corpus of all 32, so an unusual format nobody has used yet would slip through. Data can be up to 30 minutes stale, though every page displays its own last-check time. No screen-reader pass with actual assistive technology. The correction path is a report channel, not a resolution loop. All of these are written up in `docs/` rather than left for a reviewer to discover.

## Partner-facing README

https://github.com/nikjain15/hallmark/blob/main/README.md

Built against [Build OS](https://nikjain15.github.io/build-os/). Full artifact set in [`docs/`](https://github.com/nikjain15/hallmark/tree/main/docs) — PRD, architecture, two ADRs, UX, engineering, failure modes, safety, cost, stakeholders, decision log, evals — plus [`scorecard.json`](https://github.com/nikjain15/hallmark/blob/main/scorecard.json).

This build also produced a proposed **10th artifact** for Build OS: [`docs/VISUAL.md`](https://github.com/nikjain15/hallmark/blob/main/docs/VISUAL.md), a graded low-fidelity visual spec written before any application code. Every screen was drawn there first, and the build became transcription.
