# Project 1 Submission - @kureen-cyber

Summer Pilot 2026, Project 1 - PM platform.

## Production URL

https://pm-tool-hult-cohort-4.vercel.app/

## Stack and architecture

- Vite with React 18 and TypeScript
- Firebase Authentication and Cloud Firestore (projects, tasks, user profiles)
- CSS custom properties for theming (light/dark)
- Component-based Vite/React SPA with Vercel hosting and SPA rewrites

This project does not use Next.js or Tailwind CSS.

## PM core (assignment)

- **Projects:** create, edit, and archive from the Projects tab
- **Tasks:** title, description, status (≥3: todo / in progress / blocked / done), assignee, priority, due date
- **Filters:** by project, status, assignee, and priority
- **Progress:** per-project race bars from task completion; personal progress advances on sign-in and completed tasks
- **Multi-user:** signed-in participants sync projects/tasks through Firestore; chat and peer-vote directories use real `users` profiles (no fictional seed names)

## Auth

- Auth-gated landing: register or log in before using the workspace
- Firebase Email/Password with profile documents in Firestore
- Demo role-picker login removed

## Fresh-clone verification

The project was cloned into a clean directory and verified successfully:

1. `npm ci` succeeded.
2. A placeholder `.env.local` was used for build verification.
3. `npm run build` succeeded.
4. Local development runs on port `5173` (not port `3000`).

## Known limitations

- Chat message bodies still use browser local storage (directory is Firestore users).
- Weekly peer-review write-ups are localStorage; votes are device-local tallies.
- No automated test suite yet.
- Main JS bundle is large due to the Firebase client SDK.
