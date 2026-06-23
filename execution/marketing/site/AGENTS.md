# AGENTS.md — Cohort platform (Next.js)

Parent guide: [../../../AGENTS.md](../../../AGENTS.md)

## Stack

- **Next.js 15** App Router · **React 19** · **TypeScript**
- **Firebase** client auth + **firebase-admin** in API routes only
- **Vercel** deploy · styles in `app/page.module.css` + `app/globals.css`

## Key paths

| Area | Path |
|------|------|
| Routes | `app/` — `/`, `/apply`, `/dashboard`, `/history`, `/overview`, `/program`, `/program/[slug]` |
| Core libs | `lib/cohort-config.ts`, `lib/github-cohort-server.ts`, `lib/submissions-resolve-server.ts`, `lib/enrollment-server.ts`, `lib/eligible-peers-server.ts`, `lib/program-schedule.ts` |
| Program content | `content/program.ts` — titles, descriptions, pass gates |
| Participant UI | `components/ProgramProjectView.tsx`, `ProjectProgressPanel.tsx`, `PeerReviewCard.tsx` |
| Auth hook | `lib/firebase/use-github-auth.ts` |
| Roster gate | `lib/enrollment-server.ts`, `lib/require-enrolled.ts`, `GET /api/me` |
| Progress API | `lib/project-progress-server.ts` |
| Written reviews | `lib/written-reviews-server.ts`, `lib/written-reviews-format.ts` |
| Private votes | `lib/ratings-server.ts` |
| Winner tally | `lib/tally-server.ts` (`tallyThumbsUp`) |
| Cohort stats | `lib/cohort-stats-server.ts` (server) · `lib/cohort-stats-types.ts` (client-safe) |
| Agent prompts | `lib/project-agent-prompt.ts`, `components/AgentPromptHarness.tsx` |
| Branding | `components/SiteHeader.tsx`, `components/HultLogo.tsx` |

## Commands

```bash
cp .env.example .env.local   # fill Firebase + cohort org
npm install
npm run dev                  # http://localhost:3000
npm run build
```

CI uses placeholder Firebase env vars — build must pass without real credentials.

## API routes

All authenticated routes expect `Authorization: Bearer <Firebase ID token>`.

- `POST /api/applications` — apply (Admin SDK)
- `POST /api/cohort-interest` — indicate interest in next cohort (GitHub sign-in)
- `GET /api/me` — profile + enrollment state + cohort stats
- `GET /api/history` — cross-cohort merged PR history (GitHub-derived; any signed-in user)
- `GET /api/dashboard` — enrolled cross-project progress (requires roster)
- `GET /api/program/projects` — public program index (MCP + agents)
- `GET /api/cohort/stats` — public enrolled count
- `POST /api/github/webhook` — merged PR → submissions + `deployUrl` from PR body (HMAC)
- `GET /api/program/[slug]/progress` — submission + peer review state
- `POST /api/program/[slug]/written-reviews` — `{ revieweeHandle, issueUrl }`
- `POST /api/program/[slug]/ratings` — `{ revieweeHandle, rating: 'up'|'down' }` (403 without written review)

`GITHUB_TOKEN` required in production for review issue verification. Dev bypass: set `ALLOW_UNVERIFIED_REVIEWS=true` in `.env.local` only when testing without GitHub API access.

## Firestore (this app writes)

- `applications`, `roster/{cohortId}/members`, `submissions/.../entries` *(cache / migration fallback — GitHub is canonical)*
- `peerWrittenReviews/{cohortId}/projects/{slug}/voters/{voter}/entries/{reviewee}`
- `peerRatings/{cohortId}/projects/{slug}/voters/{voter}`

Schema details: [../FIREBASE.md](../FIREBASE.md)

## UI patterns

- **Server vs client:** Pages are server components; participant panels are client (`ProgramProjectView`).
- **Styles:** CSS modules from `app/page.module.css` — match Hult ivory `#f2f3ee`, red `#a81202`, sage `#74857c`.
- **Peer review list:** Collapsed accordion cards — one expanded peer at a time ([PeerReviewCard.tsx](components/PeerReviewCard.tsx)).
- **Personalization:** Use `personalizeProgramText(text, handle, org, stats)` for `{org}`, `{handle}`, `{peerCount}`.

## Do not

- Import `firebase-admin` or `*-server.ts` modules in client components.
- Commit `.env.local` or `secrets/`.
- Hardcode cohort size (30/29) — use live `cohortStats.peerReviewCount`.

## Tests & seeds

```bash
node scripts/admissions.mjs list              # staff — requires FIREBASE_SERVICE_ACCOUNT_PATH
node scripts/seed-demo-cohort.mjs             # demo roster (submissions from GitHub)
node scripts/reconcile-submissions.mjs           # diff GitHub vs Firestore cache
node scripts/reconcile-submissions.mjs --write-cache
node scripts/seed-peer-reviews.mjs            # demo written reviews + votes
node scripts/tally-votes.mjs --all            # staff thumbs-up tally
node scripts/backfill-deploy-urls.mjs --from-github
npm run verify:submissions                    # PR title matcher checks
npm run check:env                             # production env var names
```

Deploy: `vercel deploy --prod` from this directory (project `hult-cohort`).

## SEO & discovery

| Route / file | Purpose |
|--------------|---------|
| `app/robots.ts` | `/robots.txt` — allow public pages, disallow `/api/` |
| `app/sitemap.ts` | `/sitemap.xml` — home, overview, program, apply, all project slugs |
| `app/manifest.ts` | Web app manifest |
| `app/icon.tsx`, `apple-icon.tsx` | Favicons |
| `app/opengraph-image.tsx` | Default OG/Twitter card |
| `public/llms.txt` | LLM/crawler index |
| `public/.well-known/security.txt` | Security contact |
| `lib/site-config.ts` | `NEXT_PUBLIC_SITE_URL`, canonical base URL |
