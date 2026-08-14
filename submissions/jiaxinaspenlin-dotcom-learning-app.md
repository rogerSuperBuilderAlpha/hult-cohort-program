# Phase 2 Project 1 — FinLab

## Repo 

https://github.com/jiaxinaspenlin-dotcom/finlearnerslab

## Summary

FinLab is an interactive financial-literacy learning application that teaches personal finance through realistic simulations rather than static lessons. Learners make financial decisions, see deterministic outcomes, explore the tradeoffs behind those outcomes, and reflect on what they learned.

The application includes four structured learning labs:

- Build a Budget
- Build Your Safety Net
- Understand the Cost of Debt
- Make Your Money Work

FinLab also includes Finance Brain, an interactive concept map that helps learners explore relationships between concepts such as budgeting, emergency funds, liquidity, APR, interest, debt repayment, compounding, diversification, and time horizon.

The application is deployed on Vercel and uses its own backend and database for learner sessions, attempts, reflections, progress, and learning activity.

## Ludwitt/Hult app ID

le_341a97f778fba1030b0466

FinLab is registered through the hosted Ludwitt developer platform.

## Production listing URL

https://finlearnerslab.vercel.app

## Integration evidence (launch flow + events firing)

FinLab is integrated with the hosted Ludwitt platform.

The production authentication flow uses Ludwitt OAuth:

1. The learner starts the Ludwitt authentication flow from FinLab.
2. Ludwitt authenticates the learner and redirects to FinLab's registered production callback.
3. FinLab exchanges the authorization code server-side.
4. FinLab retrieves the authenticated Ludwitt user identity.
5. A secure FinLab learner session is created.
6. The learner enters the FinLab learning experience.

Production callback:

https://finlearnerslab.vercel.app/auth/callback

FinLab's learning engine instruments the core learning lifecycle, including:

- lesson/module start
- scenario or quiz submission
- lesson completion
- active learning-session heartbeat

Learner identity and session state are resolved server-side. Ludwitt credentials are never exposed to browser code, and learner reflections and financial-response details remain private to FinLab.

The complete learning flow has been tested from authentication through lab interaction, deterministic feedback, reflection, completion, and progress tracking.

## Product highlights

- Four interactive personal-finance learning labs
- Deterministic financial calculations rather than AI-generated arithmetic
- Budgeting, emergency-fund, debt/APR, and introductory investing simulations
- Finance Brain interactive concept map with 24 concepts and 31 relationships
- Personal progress tracking without learner rankings or leaderboards
- Private reflections and learner-scoped attempts
- Responsive desktop and mobile interface
- WCAG A/AA accessibility testing
- Keyboard-accessible learning flows
- Reduced-motion support
- Charts with visible textual equivalents

## Technical implementation

FinLab is built with:

- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Vercel

The application uses server-side authentication and authorization, learner-scoped database access, deterministic financial calculation utilities, and protected server-side integration with Ludwitt.

## Verification

Final local verification completed successfully:

- 552 unit/integration tests passed
- 102 end-to-end tests passed
- 654 automated tests passing overall
- TypeScript typecheck passed
- ESLint passed with 0 errors and 0 warnings
- Production build passed
- Prisma schema validation passed
- Database migrations verified
- Secret scan passed
- Fresh-clone verification passed
- WCAG 2.0/2.1 A + AA axe scans passed across the public and learner experiences on desktop and mobile

## Financial-safety note

FinLab provides educational simulations and general financial-literacy information. It does not provide individualized financial, investment, tax, or legal advice.

## Agent usage

- Research: Used AI assistance to interpret the cohort requirements, compare the reference Ludwitt integration with the hosted Ludwitt developer platform, and structure the learning experience.
- QA: Used automated unit, integration, end-to-end, accessibility, fresh-clone, security, and secret-scanning checks throughout development.

## Test plan

- [x] Production application deployed over HTTPS
- [x] Ludwitt app registered
- [x] Hosted Ludwitt authentication integrated
- [x] Production callback configured
- [x] Authenticated learner session created server-side
- [x] Four learning labs operational
- [x] Scenario submissions operational
- [x] Deterministic learner feedback operational
- [x] Learner reflections operational
- [x] Progress tracking operational
- [x] Finance Brain operational
- [x] Desktop and mobile tested
- [x] Keyboard accessibility tested
- [x] Automated accessibility scans passed
- [x] Typecheck passed
- [x] Lint passed
- [x] Unit/integration tests passed
- [x] End-to-end tests passed
- [x] Production build passed
- [x] Secret scan passed