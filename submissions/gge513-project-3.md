# Project 3 Submission — @gge513

**Latent** — a vibe marketing platform built on one idea: skill stays latent until someone asks.

## Production URL

https://latent-nu.vercel.app

Build repo: https://github.com/gge513/latent

## Sample profile URLs

- https://latent-nu.vercel.app/b/gge513 (a developed card: claimed, the builder's own words)
- https://latent-nu.vercel.app/b/priyanshshahh (a latent card: public facts, machine-derived line)
- https://latent-nu.vercel.app/b/codingwcal (a latent card)

Every participant has a page: 31 at filing, `/b/<github-handle>`.

## Vibe / positioning notes

The sharing economy made idle physical capacity reachable: cars, rooms, manufacturing slots. The
harder version is human capacity, expertise that exists, that people even want to share or donate,
but that nobody can see. This site is a darkroom for exactly that. A visitor says what they need
built, in one spoken or typed sentence, and the builders closest to that work develop out of the
dark, with plain-language reasons grounded in their public repos.

The craft claim underneath: the developing got fast, the judgment did not. Everyone sells speed
now; speed is commodity. The buyer is the photographer here: they get a judgment moment (pick one,
say why), and their own words become the message they send. Nothing a visitor types or says is
ever stored.

The consent model IS the aesthetic: an unclaimed card is latent (public GitHub facts plus a line
marked machine-derived), a claimed card is developed (their words, their name, their chosen
contact channel). Reachability is the reward for claiming.

The site also markets itself, literally. `/developing` is a content stream the site writes with no
author: a daily digest generated from the builders' public GitHub activity (cron), one builder
spotlight per day on a deterministic drip, and demo entries produced by running the real matcher
against the site's own example sentences. RSS, sitemap, per-page OG cards, and structured data are
all product-native. On its first run (Jul 31) the digest surfaced two peers' Project 3 builds from
their public GitHub activity a day before their submission PRs merged, which is the engine doing
real marketing intelligence.

## Architecture

Next.js 16.2.12 on the App Router with React 19.2.4 and TypeScript 5, Tailwind 4 for styling,
deployed on Vercel. Data is Neon serverless Postgres (`@neondatabase/serverless` 1.1.0) accessed
through Drizzle ORM 0.45.2. Authentication is Auth.js (`next-auth` 5 beta) with the GitHub
provider, used only to prove that the person claiming a card is the handle on it. Match
explanations come from the Anthropic SDK 0.115.0.

**Routes.** Pages: `/`, `/b/[handle]`, `/claim`, `/proof`, `/developing`, `/developing/[slug]`.
Feed: `/developing/feed.xml`. API: `/api/match`, `/api/event`, `/api/cron/digest`,
`/api/auth/[...nextauth]`.

**Degradation is designed, not incidental.** The matcher has three rungs: the model path, a
deterministic ranking, and a keyword fallback. The bottom two rungs need no API key and no model,
so the product answers a visitor's sentence even with the model offline. The smoke test asserts
this rather than assuming it.

## Schema

`lib/db/schema.ts`, five tables:

| Table | Shape | Note |
|---|---|---|
| `builders` | `handle` (PK), `displayName`, `github` (jsonb facts), `latentLine`, `developedLine`, `contact`, `x`/`y`, `claimedAt`, `optedOut`, `updatedAt` | `x`/`y` are the spatial layout, cosine distance plus SMACOF. `optedOut` is `not null default false` |
| `entries` | `id`, `kind`, `slug` (unique), `title`, `body`, `handle`, `sourceRef`, `publishedAt` | The `/developing` stream. Unique slug makes the spotlight run idempotent per builder |
| `vouches` | `id`, `toHandle`, `fromHandle`, `text`, `createdAt` | Peer vouches on a card |
| `events` | `id`, `kind`, `createdAt` | **Deliberately has no handle, user or IP column.** Aggregate counting only, and the schema is what enforces it |
| rate limit | `ipHash` (PK), `windowStart`, `count` | Hashed, never the address itself |

## Key files

- `lib/db/schema.ts`: the schema above
- `lib/claim.ts`: the claim write path. Every write keys off `session.user.login` and nothing
  else, so there is no card parameter to tamper with and claiming someone else is unexpressible
  rather than merely forbidden. Removal is immediate and needs no justification; `restoreCard()`
  is the inverse, so consent runs both directions
- `lib/match.ts` / `app/api/match/route.ts`: the three-rung matcher and its endpoint
- `lib/spotlight.ts`: the daily spotlight generator. Selection is deterministic (claimed builders
  in claim order, then unclaimed alphabetically) and skips opted-out builders at selection
- `lib/entries.ts`: server-only reads for `/developing`
- `lib/analytics.ts`: aggregate-only counting, one constant identity, event kind as the whole payload
- `scripts/integration-smoke.mts`: the smoke described below

## Test plan

Verified fresh at filing (site live on production):

- [x] Production URL serves; the typed sentence path returns real matches on production; "see it
      run" plays the same server path with zero input
- [x] At least 3 profile URLs render, one developed and two latent (all 200 at filing)
- [x] `/developing`: digest, spotlight and demo entries render (5 entries); RSS serves; sitemap
      lists all 39 pages
- [x] OG cards render as real PNGs for profiles, entries and the stream (verified by content type;
      the home page deliberately has none, the page itself is the product)
- [x] Claim flow (sign in with GitHub, claim, edit, remove, restore) verified end to end on
      production 2026-07-30; the first developed card is live
- [x] Cron route fails closed: unauthenticated request gets 401 (verified on production at filing)
- [x] Lint, typecheck, build and smoke green at the submitted commit
- [x] Keyword fallback (rung 3) serves matches with the API key absent, tested locally 2026-07-28,
      not re-run at filing

**CI** (`.github/workflows/ci.yml`) runs three jobs on Node 22: lint and build, a check that no
database credentials are committed, and the read-only integration smoke.

**What the smoke actually asserts** (`scripts/integration-smoke.mts`, 158 lines). It checks
invariants rather than writing rows, which is why it is safe to point at a live database:

- the `events` table has no handle, builder, user or IP column, so the privacy claim is enforced
  by the schema and not by discipline
- the `builders` table carries a `contact` column
- the roster is populated, every builder has a position in the space, every builder has a line to
  show, and zero rows leak
- deterministic ranking still returns candidates with the model offline
- the keyword rung still returns matches

**Honest gaps.** The spoken path needs a mic and a human, so the typed path is a peer rather than a
fallback. OG unfurl pasted into Slack or LinkedIn is not yet human-verified. CI smoke on the build
repo is local-only by decision, because a public repo's Actions should not hold a production
secret.

## Partner-facing README

[`README.md` in the build repo root](https://github.com/gge513/latent/blob/main/README.md),
written for a hiring partner, no internal vocabulary.

## Agent usage

- **Research:** Evernote corpus mining for positioning (the proximity thesis, the darkroom
  reference, the latent-capacity frame); peer-field checks against the cohort repo; local Next
  docs consulted per the repo's AGENTS.md.
- **Dev:** Claude Code end to end: schema and seed scripts, the streaming matcher, the spatial
  layout (cosine distance plus SMACOF), the claim flow, the content engine. Two modules ported
  from Week 2's Tavern (GitHub profile facts, auth from the hardened branch) rather than forked.
- **QA:** headless production drives (puppeteer), WCAG contrast measured by script rather than by
  eye, CI with a smoke test proven by sabotage (fails correctly when sabotaged), keyboard and
  mobile paths driven, human-only checks (clipboard, OG unfurls) named as human-only and done by
  hand where possible.
