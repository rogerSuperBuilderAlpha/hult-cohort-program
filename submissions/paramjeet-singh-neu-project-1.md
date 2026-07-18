# Project 1 Submission — @paramjeet-singh-neu

## Production URL

https://ship-vote-rosy.vercel.app/

## Source repository

https://github.com/Paramjeet-singh-neu/ShipVote

## Summary

ShipVote is a React 19 project-management platform that combines a shared
Supabase-backed PM baseline with a motivation layer designed to help the cohort
see progress, celebrate completed work, and recover momentum when blocked.

## Setup steps verified on fresh clone

1. Clone `https://github.com/Paramjeet-singh-neu/ShipVote`
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Run `supabase/schema.sql` in the Supabase SQL Editor
6. In Supabase Auth → Providers → Email, disable **Confirm email** for
   frictionless reviewer signup
7. Run `npm run dev` and open `http://localhost:5173`

Verified locally:

- `npm run build` passes
- `npm run lint` passes
- Email/password signup works against the production Supabase project
- Project and task creation work with refresh persistence
- The production deployment returns HTTP 200 over HTTPS

## Architecture summary

- **Frontend:** React 19 + Vite 8, JSX
- **Styling:** inline styles and CSS custom properties; no CSS framework
- **Authentication:** Supabase Auth with open email/password signup
- **Shared database:** Supabase Postgres
  - `profiles`
  - `projects`
  - `tasks`
- **Authorization:** Row Level Security policies for authenticated cohort access
- **PM workflow:** create/edit/archive projects; create tasks with title,
  description, assignee, and `todo` / `in_progress` / `done` status; filter by
  project, status, and assignee
- **Motivation state:** browser-local `shipvote_local` store for commitments,
  feed reactions, daily puzzle progress, and weekly demo surfaces
- **Hosting:** Vercel

The shared PM baseline is in `src/PmView.jsx`. Supabase session/profile state is
managed by `src/lib/auth.jsx`, the browser client is initialized in
`src/lib/supabase.js`, and database setup/RLS live in `supabase/schema.sql`.

## Motivation / engagement design notes

ShipVote avoids surveillance-oriented productivity mechanics. It emphasizes
collective progress and the next useful action:

- Commitment wall: each member states what they intend to ship
- Collective progress bar: a crew goal, not a ranking
- Ship Feed: completed shared tasks and docked projects become visible wins
- Kudos: lightweight 🔥, 👏, and 🚀 reactions instead of mid-week numeric scoring
- Numeric ratings are available only during the voting phase
- Ship Room: voluntary logs, build-list progress, harbor momentum, and a
  shareable crew dispatch
- Daily tech fact paired with an encouraging builder message
- Daily Brain Break: short logic/math/word puzzles with hints and a personal
  streak to help members reset when blocked
- Return banner summarizes new ships and kudos since the previous visit

## Known limitations

- Commitments, kudos, ship logs, and Brain Break streaks are browser-local;
  accounts, projects, assignments, and tasks are shared through Supabase
- The weekly Board's eight demo personas are separate from authenticated
  Supabase identities
- Cross-account assignment is implemented but has not yet been independently
  smoke-tested with a second email account
- No automated end-to-end test suite or concurrent-user load test yet
- No task comments, due-date reminders, or assignment notifications yet
- The optional Anthropic key is stored in the browser for demo tips/summaries;
  production AI calls should move behind a server proxy
- The client bundle is slightly above Vite's 500 kB warning threshold

## Agent usage summary

- **Research:** inspected the official Project 1 requirements, rubric,
  submission branch conventions, and peer submission patterns
- **Development:** implemented the Supabase auth/profile layer, PM baseline,
  motivation mechanics, daily tech fact, and Daily Brain Break
- **QA:** ran build/lint checks, verified the HTTPS deployment, confirmed the
  deployed Supabase configuration, and manually tested signup/project/task
  persistence
- **Human direction:** product scope, motivation philosophy, backend choice,
  deployment, Supabase configuration, and submission decisions were directed
  by Paramjeet Singh

## Test plan

- [x] Production URL returns HTTP 200 over HTTPS
- [x] Open email/password signup
- [x] Create, edit, and archive a project
- [x] Create tasks with title, description, status, and assignee
- [x] Move tasks through To do → In progress → Done
- [x] Filter tasks by project, status, and assignee
- [x] Data survives refresh
- [x] Completing a shared task adds a Ship Feed activity entry
- [x] `npm run build`
- [x] `npm run lint`
- [ ] Verify assignment visibility using two independent production accounts
- [ ] Run a 10-user concurrent load test

