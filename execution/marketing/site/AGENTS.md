# AGENTS.md — Cohort platform (Next.js)

Parent guide: [../../../AGENTS.md](../../../AGENTS.md)

## Stack

- **Next.js 15** App Router · **React 19** · **TypeScript**
- **Firebase** client auth + **firebase-admin** in API routes only
- **Vercel** deploy · styles in `app/page.module.css` + `app/globals.css`

## Key paths

| Area | Path |
|------|------|
| Routes | `app/` — `/`, `/apply`, `/overview`, `/program`, `/program/[slug]` |
| Program content | `content/program.ts` — titles, descriptions, pass gates |
| Participant UI | `components/ProgramProjectView.tsx`, `ProjectProgressPanel.tsx`, `PeerReviewCard.tsx` |
| Auth hook | `lib/firebase/use-github-auth.ts` |
| Roster gate | `lib/participant-status.ts`, `GET /api/me` |
| Progress API | `lib/project-progress-server.ts` |
| Written reviews | `lib/written-reviews-server.ts`, `lib/written-reviews-format.ts` |
| Private votes | `lib/ratings-server.ts` |
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
- `GET /api/me` — profile + admitted status + cohort stats
- `GET /api/cohort/stats` — public enrolled count
- `GET /api/program/[slug]/progress` — submission + peer review state
- `POST /api/program/[slug]/written-reviews` — `{ revieweeHandle, issueUrl }`
- `POST /api/program/[slug]/ratings` — `{ revieweeHandle, rating: 'up'|'down' }` (403 without written review)

Optional: set `GITHUB_TOKEN` server-side to verify review issue titles via GitHub API.

## Firestore (this app writes)

- `applications`, `roster/fall26/members`, `submissions/.../entries`
- `peerWrittenReviews/fall26/projects/{slug}/reviewers/{voter}/reviews/{reviewee}`
- `peerRatings/fall26/projects/{slug}/voters/{voter}`

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
node scripts/seed-demo-cohort.mjs      # requires FIREBASE_SERVICE_ACCOUNT_PATH
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
