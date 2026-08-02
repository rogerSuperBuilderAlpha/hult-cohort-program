# Project 3 â€” Public showcase Â· arjun-singh2127

**Good Vibes** â€” the public marketing site for the Hult Cohort Developer
Program, Summer 2026 pilot.

| | |
|---|---|
| **Production URL** | https://good-vibes-zeta.vercel.app |
| **Build repo (public)** | https://github.com/arjun-singh2127/Good-Vibes |
| **Partner-facing README** | [`PARTNERS.md`](https://github.com/arjun-singh2127/Good-Vibes/blob/main/PARTNERS.md) |

---

## What shipped

A production marketing site that presents the cohort as a **studio collective**
partners can hire, with a page for every enrolled participant and a route from
any profile out to that person's own work.

| Route | Purpose |
|---|---|
| `/` | Cohort narrative, how the programme works, featured builders, latest merges |
| `/builders` | Full roster, alphabetical, with live GitHub profiles |
| `/builders/<handle>` | Profile: bio, cohort deployments, their own live sites, public repos, merged submissions |
| `/work` | Merged submissions by phase, plus confirmed live deployments |
| `/status` | Read-only project view â€” recent merges and last-merge dates per phase |
| `/partners` | Engagement models, fee model, intro form, privacy and opt-out |
| `/api/request-intro` | Files a partner request as a tracked GitHub issue |

---

## Requirements coverage

| Requirement | How it is met |
|---|---|
| Public homepage, no login | Static homepage; cohort name, term and narrative above the 200-word minimum |
| Student profiles | One page per enrolled participant at `/builders/<handle>` |
| Portfolio links | Cohort deployments, personal site, repo `homepage` live sites, and public repos |
| **PM integration (real data)** | Merged submission PRs read live from the GitHub API â€” titles, authors, merge timestamps, deep links. No fixtures. |
| Partner section | `/partners` â€” engagement models, fee model, contact |
| Request intro | Form â†’ tracked GitHub issue, immediately, with honeypot + rate limiting |
| Privacy | Opt-in by default; `optedOut` renders a placeholder, skips fetches, sets `noindex`, drops from sitemap |
| SEO | Per-route `<title>` and meta description, Open Graph and Twitter tags, generated OG images, `sitemap.xml`, `robots.txt` |
| Deployment | Public HTTPS, no auth on public pages |

### On "no hardcoded lorem ipsum"

The roster seed in `data/cohort.ts` stores **only GitHub handles**, taken from
real submission pull requests in the cohort repository. Every name, bio, avatar,
location, repository and merge timestamp is fetched live from the GitHub API at
request time and revalidated every 30 minutes.

If GitHub is unreachable, affected sections render **empty states** rather than
fabricated content.

---

## Design

Colour values were sampled from the two sibling cohort apps so the three
products read as one family:

- **Helm** (Project 1) â€” background `#0f172a`, surfaces `#1e293b`, borders
  `#334155`, accent `#10b981`
- **Link UP** (Project 2) â€” near-black background, green `#33c46d`

Type pairs Fraunces (editorial display) with Inter and JetBrains Mono. Motion is
limited to a single hero marquee, which respects `prefers-reduced-motion`.

The site deliberately shows **no aggregate submission counts** and does not rank
builders. The roster is alphabetical. It presents a collective, not a
leaderboard.

---

## Tech

Next.js (App Router, React Server Components), TypeScript in strict mode,
Tailwind CSS v4, `next/og` for generated Open Graph images. No database â€” GitHub
is the source of truth, cached with ISR.

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | **Yes** | Authenticates GitHub reads and files intro issues |
| `INTRO_ISSUE_REPO` | For the form | `owner/repo` receiving partner intros |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin for metadata and sitemap |

`GITHUB_TOKEN` is required in practice: a cold build makes roughly two calls per
participant plus the pull request queries â€” about 65 â€” against GitHub's
anonymous ceiling of 60 per hour. Without it the build succeeds but content
sections render empty. The code logs a build-time warning when it is absent.

---

## Verification

Run locally against a fresh clone:

- `npm install` â€” clean install, **0 vulnerabilities** (`npm audit`)
- `npx tsc --noEmit` â€” no type errors
- `npm run lint` â€” no ESLint warnings or errors
- `npm run build` â€” compiles; prerenders every builder page
- Route smoke test â€” `/`, `/builders`, three sample profiles, `/work`,
  `/status`, `/partners`, `/sitemap.xml`, `/robots.txt`, site and per-builder
  OG images all return 200; an unknown builder returns 404
- API â€” missing fields return 400, unconfigured routing returns a clear 503,
  honeypot submissions accept silently

---

## Privacy

Participants are enrolled with a public profile by default and may opt out by
opening an issue in the cohort repository. Opting out renders a private
placeholder, stops all profile fetches for that person, marks the page
`noindex`, and removes them from the sitemap.
