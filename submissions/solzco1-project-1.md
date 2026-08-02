# Project 1 Submission — @solzco1

**Production URL:** https://admissions-task-board-fall26.vercel.app

**Code:** https://github.com/solzco1/admissions-task-board-fall26 (branch `participants/summer26/phase-1-project-1/solzco1`)

## Summary

Cohort PM — Next.js 14 + Supabase project management platform extending the admissions task board. Authenticated accounts, projects, task CRUD, assignee workflows, kanban status columns (To Do / In Progress / Done), progress visibility, and a Latest Activity feed.

## Architecture summary

- **Frontend:** Next.js App Router + Tailwind
- **Backend / Auth / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Vercel (`*.vercel.app`)
- Server Actions for mutations; RLS enforces project membership access

## Agent usage

Built with Cursor AI Composer for architecture, Supabase integration, UI implementation, test coverage, and production debugging (Vercel branch/framework mismatch, RLS recursion fix).

## Known limitations

- MVP focuses on core task/project CRUD
- No invite flow for project members (owner-only creation)
- No email/push notifications or realtime subscriptions
