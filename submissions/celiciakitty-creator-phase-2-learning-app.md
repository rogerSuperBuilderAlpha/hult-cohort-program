# P2-L1 Learning App Submission — @celiciakitty-creator

**Celicia Arneaud** — Hult Cohort Developer Program — Summer 2026 — Phase 2, Project 1 (Ludwitt/Hult learning app)

- **Ludwitt/Hult app ID:** *Pending — not exposed through the Ludwitt Creator registration flow (see clarification below)*
- **Production listing URL:** https://lex-learn-ten.vercel.app/
- **Source repo:** https://github.com/celiciakitty-creator/LexLearn

## Metrics API snapshot

**Status: pending / blocked**

Week 4 requirements reference a launch JWT, learning events, metrics endpoints, app ID, and listing URL. The Ludwitt Creator registration flow I completed exposes OAuth client credentials and Pitchrise integration, but does not appear to expose the app ID, launch-token flow, or metrics API surface described in the cohort Week 4 brief.

| Item | Status |
|---|---|
| Ludwitt/Hult app ID | **Pending** — not returned by Creator registration flow |
| Metrics API snapshot (date-stamped) | **Pending** — cannot fetch without confirmed app ID and working integration path |
| `unique_users` / `qualified_users` | **Not reported** — no verified snapshot available |
| Learning event evidence | **Pending** — event firing not verified end-to-end |

## Promotion channels used

**Status: pending**

External promotion has not yet been documented in this submission. Promotion will be recorded here once the Ludwitt integration path is confirmed and metrics can be verified through the platform snapshot.

## Summary

**LexLearn** is a beginner-friendly UK law learning platform covering **Civil Law**, **Criminal Law**, and **Everyday Law**. Learners work through structured content with interactive quizzes, progress tracking, achievements, and learning levels. Supplementary formats include **Legal Bites**, **Case Spotlights**, **Statute Spotlights**, and real-world legal scenarios. The app is responsive, includes legal review documentation, and is deployed on Vercel.

Ludwitt Creator registration and OAuth 2.0 integration work are implemented in the application repository, but launch-token auth, event instrumentation, and verified platform metrics remain blocked pending clarification on the intended Week 4 integration path.

## Architecture summary

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI:** shadcn/Base UI, Framer Motion, Lucide React
- **Content:** 5 complete learning modules with interactive quizzes, achievements, learning levels, Legal Bites, Case Spotlights, Statute Spotlights, and real-world legal scenarios
- **Progress:** browser `localStorage` progress tracking
- **Deployment:** Vercel — https://lex-learn-ten.vercel.app/

### Ludwitt integration (implemented in repo; end-to-end verification pending)

- App registered through the Ludwitt Creator / Learning Engineer registration flow
- Ludwitt OAuth 2.0 integration implemented:
  - PKCE S256
  - CSRF state protection
  - server-side authorization code exchange
  - userinfo support
  - encrypted HttpOnly session cookie
  - login / logout routes
  - protected learning routes when OAuth is configured

### Ludwitt integration (not verified / blocked)

| Capability | Status |
|---|---|
| OAuth authorize → token exchange → authenticated session | **Blocked** — authorize endpoint currently returns `invalid_client` despite client ID and registered callback URI matching the Ludwitt dashboard |
| Launch JWT entry flow | **Not implemented** — not exposed through Creator registration flow |
| Learning event tracking to Ludwitt/Hult events API | **Pending** — no verified event firing |
| Metrics API readback | **Pending** — no app ID or working integration path confirmed |

## Clarification question for staff

**Is the Ludwitt Creator OAuth integration the intended Week 4 launch integration, or are we expected to self-host / use the Hult cohort JWT + events reference API?**

The live Creator registration flow provides OAuth client credentials and Pitchrise integration, but the Week 4 brief references a launch JWT, learning events, metrics API, app ID, and listing URL that do not appear to be exposed through that registration path. Before I can complete verified event instrumentation and a date-stamped metrics snapshot, I need confirmation of which integration surface is authoritative for Week 4 pass-gate evidence.

## Setup steps verified on a fresh clone

```bash
git clone https://github.com/celiciakitty-creator/LexLearn
cd LexLearn
npm install
cp .env.local.example .env.local   # fill Ludwitt OAuth vars when integration path is confirmed
npm run dev                        # http://localhost:3000
```

```bash
npm run lint      # passes
npm run build     # passes
```

## Known limitations

| Limitation | Context |
|---|---|
| Ludwitt app ID unavailable | Creator registration flow does not expose the app ID referenced in Week 4 requirements |
| OAuth login blocked | Authorize endpoint returns `invalid_client` with dashboard-matched client ID and callback URI |
| Launch JWT flow not wired | Week 4 JWT entry pattern not implemented; unclear if required alongside or instead of Creator OAuth |
| Event instrumentation unverified | No confirmed end-to-end event firing or metrics readback |
| Progress stored in `localStorage` | No shared account-backed progress without working Ludwitt session |
| External promotion not yet documented | Promotion channels and qualified-user evidence pending integration unblock |

## Agent usage summary

LexLearn was built and iterated manually with Cursor for component implementation, content structure, styling, accessibility, and production readiness. Integration scaffolding for Ludwitt OAuth was implemented against the Creator registration flow; debugging of the `invalid_client` authorize response and alignment with the cohort JWT/events reference API is ongoing pending staff clarification.
