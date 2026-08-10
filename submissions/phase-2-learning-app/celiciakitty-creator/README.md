# LexLearn

LexLearn is a beginner-friendly UK law learning platform covering **civil law**, **criminal law**, and **everyday legal topics**. Content focuses on the law of **England and Wales** unless a section explicitly states otherwise.

Interactive lessons, realistic scenarios, Case Spotlight and Statute Spotlight explainers, Legal Bites, quizzes, and local progress tracking help learners understand how law applies in everyday life—without replacing professional legal advice.

## Screenshots

Add production screenshots to `README-assets/` when available:

| Screenshot | Path | Status |
|------------|------|--------|
| Homepage | `README-assets/homepage.png` | Placeholder — capture after deploy |
| Learning dashboard | `README-assets/learn-dashboard.png` | Placeholder — `/learn` |
| Lesson | `README-assets/lesson.png` | Placeholder — `/learn/1` |
| Quiz | `README-assets/quiz.png` | Placeholder — `/quiz/1` |
| Progress | `README-assets/progress.png` | Placeholder — `/progress` |

**Open Graph image:** Generated at build time by `app/opengraph-image.tsx` (1200×630). Optional: replace with a static marketing asset at `public/images/og-image-marketing.png` and update metadata if a custom designed share image is provided.

## Current features

- **Five-module learning path** with sequential unlock (quiz pass required)
- **Module lessons** with learning objectives, scenarios, key terms, embedded knowledge checks, and takeaways
- **Module quizzes** — five multiple-choice questions with immediate explanations (pass threshold: 3/5)
- **Case Spotlight** — reusable case/scenario cards linked to modules
- **Statute Spotlight** — reusable statute explainers (e.g. Consumer Rights Act 2015)
- **Legal Bites** — categorised legal facts with review status badges
- **Achievements** — stored in browser localStorage (First Lesson, First Quiz, category starters, Five Correct Answers)
- **Learning levels** — Legal Beginner through LexLearn Scholar
- **Progress dashboard** at `/progress`
- **Ludwitt OAuth sign-in** — server-managed sessions for tracked lessons and quizzes
- **Legal disclaimer** on lessons, quizzes, and site footer

## Current modules

| # | Module | Category | Status |
|---|--------|----------|--------|
| 1 | Contracts in Everyday Life | Civil Law | Live |
| 2 | Negligence and Duty of Care | Civil Law | Live |
| 3 | Crime: Acts, Intent and Responsibility | Criminal Law | Live |
| 4 | Assault, Self-Defence and Weapons | Criminal Law | Live |
| 5 | Your Everyday Legal Rights | Everyday Law | Live |

**Unlock order:** Module 1 → 2 → 3 → 4 → 5 (each unlocks when the previous module quiz is passed).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI)
- Framer Motion
- Lucide icons
- Playfair Display + Geist fonts
- Browser `localStorage` for progress and achievements (no database)

## Local setup

```bash
# Install dependencies
npm install

# Copy environment template (placeholders only — no secrets)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Lint
npm run lint

# Production build
npm run build
```

## Environment variables

`.env.local` is gitignored. `.env.example` contains **placeholders only** and is safe to commit.

| Variable | Required | Notes |
|----------|----------|-------|
| `LUDWITT_CLIENT_ID` | For OAuth | Server-only |
| `LUDWITT_CLIENT_SECRET` | For OAuth | Server-only |
| `LUDWITT_REDIRECT_URI` | For OAuth | Must match Ludwitt app registration exactly |
| `LUDWITT_SESSION_SECRET` | For OAuth | ≥32 characters; encrypts HttpOnly session cookie |
| `NEXT_PUBLIC_SITE_URL` | Production | Public site URL for metadata/Open Graph (no trailing slash) |

### Callback URL formats

| Environment | `LUDWITT_REDIRECT_URI` |
|-------------|------------------------|
| Local | `http://localhost:3000/auth/callback` |
| Production | `https://<your-production-domain>/auth/callback` |

OAuth token exchange and authorize redirects use `LUDWITT_REDIRECT_URI` from the environment — there is **no hardcoded localhost URL** in application code.

When Ludwitt env vars are unset, LexLearn runs in local-only mode (progress still uses `localStorage`; auth gates allow access).

## Deploy to Vercel

1. Push the repository to GitHub or GitLab and import the project in [Vercel](https://vercel.com).
2. Framework preset: **Next.js** (auto-detected).
3. Set **Environment Variables** in the Vercel project settings (Production and Preview as needed):

   - `LUDWITT_CLIENT_ID`
   - `LUDWITT_CLIENT_SECRET`
   - `LUDWITT_REDIRECT_URI` → `https://<your-production-domain>/auth/callback`
   - `LUDWITT_SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL` → `https://<your-production-domain>`

4. Register the production callback URL with Ludwitt staff for your OAuth client.
5. Deploy. Vercel runs `npm run build` automatically.

```bash
# Optional: deploy from CLI after linking
npx vercel
npx vercel --prod
```

### Deployment blockers (known)

| Blocker | Status |
|---------|--------|
| Ludwitt OAuth `invalid_client` | **Awaiting platform clarification** — token exchange currently returns `invalid_client` with configured credentials |
| Production callback URL | Must be registered with Ludwitt for your deployed domain |
| Ludwitt AI credit proxy | **Not implemented** — `credits:spend` scope requested at auth but unused |
| Hult JWT launch / learning events | **Unresolved** — separate from Pitchrise LE OAuth; pending cohort clarification |

## Project structure

```
app/              # Routes (home, learn, quiz, progress, auth)
components/       # UI (home, learn, layout)
hooks/            # useProgress, useAchievements
lib/
  course/         # Module registry and lesson/quiz content
  ludwitt/        # OAuth client, PKCE, encrypted session cookie
  achievements/   # Achievement definitions and evaluation
  progress/       # localStorage progress and learning levels
  legal-facts.ts  # Legal Bites content
  case-spotlights.ts
  statute-spotlights.ts
docs/             # Architecture, content plan, changelog, legal review
README-assets/    # README screenshot placeholders
```

See `docs/ARCHITECTURE.md` for full technical documentation.

## Project status

| Area | Status |
|------|--------|
| All five modules | **Implemented** — lessons + quizzes |
| Ludwitt OAuth | **Implemented** — sign-in UI and server session; platform `invalid_client` pending |
| Hult JWT launch / learning events | **Pending** — cohort clarification required |
| Cross-device progress sync | Not planned for current phase |
| Legal content review | Modules 2–5 flagged — see `docs/LEGAL_REVIEW.md` |

## Disclaimer

LexLearn provides **general educational information about UK law and is not legal advice**. For legal problems, consult a qualified professional.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Content plan](docs/CONTENT_PLAN.md)
- [Changelog](docs/CHANGELOG.md)
- [Legal review checklist](docs/LEGAL_REVIEW.md)
