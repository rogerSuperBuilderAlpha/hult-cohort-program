# Cohort PM Tool

Project management platform for the Hult Cohort Developer Program Summer Pilot 2026 — accounts, projects, tasks, assignments, and status workflows, plus motivation features (streaks, progress bars, leaderboard).

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Firebase Auth (email/password) + Firestore
- Deployed on Vercel

## Setup (fresh clone)

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Firebase project's web config
npm run dev
```

## Data model
- `users/{uid}` — profile, streak, total tasks completed
- `projects/{projectId}` — shared cohort projects
- `projects/{projectId}/tasks/{taskId}` — status: todo / in_progress / done, priority, due date, assignee

## Deploying Firestore rules
```bash
firebase deploy --only firestore:rules
```
