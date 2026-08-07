# Project 1 Submission - @celiciakitty-creator

Built **Anovia**, an AI-powered project management platform designed around motivation, sustainable productivity, and team progress.

## Production URL

https://anovia.vercel.app/

## Setup steps verified on fresh clone

1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

Production build verified with:

```bash
npm run build
```
## Architecture summary

Anovia is built with Next.js 16, React, TypeScript, and Tailwind CSS and is deployed on Vercel.

The application is organized into reusable feature modules and providers for:

- projects and tasks
- calendar events
- comments and discussions
- theme preferences
- wellness tracking
- Break Zone activities
- Kizuna reminders and chat
- onboarding and celebrations
- Growth Garden progress

Current user data is stored in browser `localStorage`, with the UI and storage logic separated so the persistence layer can later be replaced by authentication and a shared database.

## Motivation / engagement design notes

Anovia is designed to help users understand where they stand, identify their next action, and remain motivated without encouraging burnout.

Motivation and engagement features include:

- Kizuna, a rule-based productivity and wellness assistant
- project and task progress visibility
- inline status changes
- completed-task tracking
- streaks and celebration moments
- Growth Garden progression
- smart deadline and wellness reminders
- customizable themes and dark mode
- Focus Timer and hydration tracking
- Break Zone trivia, reaction game, fun facts, and break timer
- motivational quotes and focus-music shortcuts

## Known limitations

- Data currently persists only in the user's browser through `localStorage`.
- Authentication and a shared multi-user database are not yet implemented.
- Team collaboration is not real-time.
- Kizuna currently uses deterministic, rule-based responses rather than an external LLM.
- The Team workspace is still an early presentation-ready version.

## Agent usage summary

Cursor agents were used to accelerate component implementation, refactoring, debugging, accessibility improvements, hydration fixes, responsive styling, and production-readiness checks.

The product concept, feature prioritization, UX direction, branding, testing decisions, review of generated code, and final deployment were directed manually.

## Agent usage

- Research: React and Next.js patterns, hydration-safe local storage, accessibility, and project-management UX.
- Dev: Reusable UI components, feature providers, local persistence, responsive layouts, and application workflows.
- QA: `npm run lint`, `npm run build`, route testing, browser-console testing, refresh persistence checks, and Vercel production testing.

## Test plan

- [x] Production build completes successfully
- [x] Dashboard loads
- [x] Projects and tasks can be created and updated
- [x] Task statuses can be changed inline
- [x] Calendar events persist after refresh
- [x] Themes and dark mode work
- [x] Wellness tools and Break Zone activities work
- [x] Kizuna panel and reminders work
- [x] Main routes load without hydration errors
- [x] Production deployment is live over HTTPS

I'd like to present on Friday.