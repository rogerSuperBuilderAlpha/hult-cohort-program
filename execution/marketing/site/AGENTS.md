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
| Core libs | `lib/cohort-config.ts`, `lib/github-cohort-server.ts`, `lib/contest-state-server.ts`, `lib/submissions-resolve-server.ts`, `lib/enrollment-server.ts`, `lib/eligible-peers-server.ts`, `lib/program-schedule.ts` |
| Program content | `content/program.ts` — titles, descriptions, pass gates |
| Participant UI | `components/ProgramProjectView.tsx`, `ProjectProgressPanel.tsx`, `PeerReviewCard.tsx` |
| Auth hook | `lib/firebase/use-github-auth.ts` |
| Roster gate | `lib/enrollment-server.ts`, `lib/require-enrolled.ts`, `GET /api/me` |
| Progress API | `lib/project-progress-server.ts` (slices cached contest state) |
| Contest state | `lib/contest-state-server.ts` — GitHub PRs + review issues (`Vote: up`) |
| Issue template | `lib/written-reviews-format.ts` |
| Winner tally (staff CLI) | `lib/tally-server.ts` · `npx tsx scripts/tally-votes.ts --publish --confirm` |
| Contest outcomes | `lib/project-outcomes-server.ts` · Firestore `projectOutcomes/{cohort}/projects/{slug}` |
| Expectations ack | `lib/expectations-ack-server.ts` · `POST /api/me/acknowledgment` |
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
- `GET /api/me` — profile + enrollment state + cohort stats + expectations acknowledgment
- `POST /api/me/acknowledgment` — sign community Expectations Acknowledgment (enrolled)
- `GET /api/program/outcomes` — published Phase 1 contest winners (enrolled)
- `GET /api/history` — cross-cohort merged PR history (GitHub-derived; any signed-in user)
- `GET /api/dashboard` — enrolled cross-project progress (requires roster)
- `GET /api/program/projects` — public program index (MCP + agents)
- `GET /api/cohort/stats` — public enrolled count
- `POST /api/github/webhook` — merged PR / review issue → bust contest caches (HMAC)
- `GET /api/program/[slug]/progress` — submission + personal peer-review status (GitHub)
- `GET /api/cron/warm-contest` — warm contest cache for open review windows (`CRON_SECRET`)
- `POST /api/program/[slug]/written-reviews` — **410** (retired; GitHub discovery)
- `POST /api/program/[slug]/ratings` — **410** (retired; `Vote: up` on GitHub)

`GITHUB_TOKEN` required in production for contest state (PRs + issue search).

## Firestore (this app writes)

- `applications`, `roster/{cohortId}/members`, expectations ack, research survey, `projectOutcomes`
- Contest data (**not** stored): submissions, peer reviews, upvotes — GitHub only via `fetchContestState`

Schema details: [../FIREBASE.md](../FIREBASE.md)

## UI patterns

- **Server vs client:** Pages are server components; participant panels are client (`ProgramProjectView`).
- **Styles:** CSS modules from `app/page.module.css` — match Hult cream `#fffae7`, magenta `#cc164c`, ink `#2b2b2b` (2025 web palette).
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
node scripts/reconcile-submissions.mjs           # report-only GitHub vs legacy cache
npx tsx scripts/tally-votes.ts --all             # staff upvote tally (GitHub)
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
