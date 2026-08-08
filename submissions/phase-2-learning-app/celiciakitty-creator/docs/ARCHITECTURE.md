# LexLearn Architecture

LexLearn is a beginner-friendly UK law learning platform built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui** (Base UI). Progress and achievements are stored in the browser via `localStorage`. Learner identity for tracked lessons uses **Ludwitt OAuth** with server-managed encrypted sessions.

## High-level structure

```
app/                    # Next.js routes
components/
  home/                 # Homepage sections
  learn/                # Learning UI (lessons, quizzes, progress widgets)
  layout/               # Shell, header, disclaimer, auth actions
hooks/                  # Client hooks (progress, achievements)
lib/
  ludwitt/              # OAuth config, PKCE, token exchange, encrypted session
  achievements/         # Achievement definitions and evaluation
  course/               # Module registry, lesson/quiz content, unlock logic
  progress/             # localStorage progress + learning levels
  case-spotlights.ts    # Case Spotlight content
  legal-facts.ts        # Legal Bites content
  homepage-data.ts      # Static homepage copy
  navigation.ts         # Site nav + legal disclaimer
public/images/          # Static assets (floral banner)
docs/                   # Project documentation
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero, features, Legal Bites, Case Spotlight, progress, modules, Why Learn UK Law |
| `/learn` | Module list, Legal Bites carousel, Case Spotlight |
| `/learn/[moduleId]` | Lesson view — Ludwitt sign-in required when OAuth is configured |
| `/quiz/[moduleId]` | Module quiz — Ludwitt sign-in required when OAuth is configured |
| `/progress` | Learning level, achievements, module breakdown |
| `/auth/login` | Starts Ludwitt OAuth (PKCE S256 + CSRF state) |
| `/auth/callback` | Exchanges code server-side, creates session, redirects |
| `/auth/logout` | Revokes token (best-effort) and clears session |
| `/auth/error` | Branded OAuth error page |
| `/api/auth/me` | Returns public profile only — never tokens |

## Ludwitt OAuth flow

1. User clicks **Sign in with Ludwitt** → `GET /auth/login`
2. Server generates CSRF `state` and PKCE `code_verifier` / S256 `code_challenge`
3. Transient values stored in HttpOnly, SameSite=Lax cookies (10 min)
4. Redirect to `https://pitchrise.ludwitt.com/oauth/authorize` with scopes `profile credits:read credits:spend`
5. Ludwitt redirects to `GET /auth/callback?code=…&state=…`
6. Server verifies state, exchanges code at `/api/oauth/token` (includes `code_verifier`)
7. Server fetches userinfo, creates encrypted session cookie, redirects to `/learn` or `returnTo`
8. `GET /api/auth/me` exposes `{ sub, email, name, picture }` only

### Session storage (local MVP)

Official Ludwitt docs recommend storing tokens keyed by internal user id on the server. For this MVP, tokens live inside an **AES-256-GCM encrypted HttpOnly cookie** (`lexlearn_ludwitt_session`, 7-day max age). Access tokens are refreshed server-side when near expiry. No access or refresh tokens are exposed to the browser (`localStorage`, `sessionStorage`, URL params, or client-readable cookies).

A persistent database store may be required for production multi-device sessions or horizontal scaling — that decision is deferred.

### Environment variables

| Variable | Notes |
|----------|-------|
| `LUDWITT_CLIENT_ID` | Server-only |
| `LUDWITT_CLIENT_SECRET` | Server-only |
| `LUDWITT_REDIRECT_URI` | Local: `http://localhost:3000/auth/callback` |
| `LUDWITT_SESSION_SECRET` | ≥32 chars; cookie encryption key |

### Security measures

- PKCE S256 on authorization code flow
- CSRF state verification
- HttpOnly + SameSite=Lax cookies; `Secure` in production
- Short-lived OAuth transient cookies (10 min)
- Server-only modules for credentials and token exchange
- Friendly `/auth/error` pages — no secrets or raw tokens in UI
- Logout revokes access token (RFC 7009, best-effort)

### Auth gates

- Homepage and `/learn` module list remain public
- `LudwittAuthGate` wraps lesson and quiz views when OAuth env vars are set
- When OAuth is not configured, gates allow local development without sign-in

## Course model

- **Three subject categories:** Civil Law, Criminal Law, Everyday Law
- **All five modules** have full lesson + quiz content in `lib/course/content/`
- **Unlock rule:** Module 1 always available; later modules unlock when the previous module quiz is passed (≥ pass threshold)
- **Progress shape:** `CourseProgress` in `lib/course/types.ts` — per-module lesson/quiz flags plus `totalCorrectAnswers` for achievements

## Client state

### Progress (`lexlearn-course-progress-v1`)

- Read/write: `lib/progress/storage.ts`
- Hook: `hooks/use-progress.ts` — `useSyncExternalStore` with cached snapshots and `lexlearn-progress-change` events
- Mutations: `completeLesson`, `completeQuiz`, `touchModule`, `recordQuizAttempt`

### Achievements (`lexlearn-achievements-v1`)

- Definitions: `lib/achievements/types.ts`
- Evaluation: `lib/achievements/index.ts` — synced automatically on progress writes
- Hook: `hooks/use-achievements.ts`

### Learning levels

- Defined in `lib/progress/levels.ts`
- Derived from completed module count via `getLevelProgress()` / `getCourseSummary()`

## Reusable learning components

| Component | File | Role |
|-----------|------|------|
| `CaseSpotlightCard` | `components/learn/case-spotlight.tsx` | Real-world case explainer |
| `LegalBites` | `components/learn/legal-bites.tsx` | Categorised legal facts with carousel |
| `AchievementCard` | `components/learn/achievement-card.tsx` | Single achievement display |
| `AchievementsSection` | `components/learn/achievements-section.tsx` | Progress page achievement grid |
| `LearningLevelCard` | `components/learn/learning-level-card.tsx` | Level title + progress to next level |
| `StatuteSpotlightCard` | `components/learn/statute-spotlight.tsx` | Statute explainer (e.g. CRA 2015) |
| `LessonView` / `QuizView` | `components/learn/` | Core learning flows |

## Design system

Brand tokens in `app/globals.css`: `lex-navy`, `lex-pale`, `lex-surface`, `lex-gold`. Headings use Playfair Display (`font-serif`); body uses Geist Sans.

## SSR / hydration

- Progress and achievement hooks use stable server snapshots to avoid hydration loops
- Hero LCP image is a server component (`hero-banner-image.tsx`) with `priority` preload

## Not yet implemented

- Ludwitt AI credit proxy and `credits:spend` usage
- Hult cohort JWT launch and learning event tracking (pending staff clarification)
- Production Ludwitt callback URL registration for deployed domain
- Persistent server-side token store (database) for multi-instance deployments
- Cross-device progress sync
