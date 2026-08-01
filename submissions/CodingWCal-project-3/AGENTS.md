# Vibe Marketing Platform — Project Context for OpenCode

## What This App Is
A curated editorial showcase for Cursor Boston x Hult cohort members' best weekly builds. Think Stripe Press meets Are.na — not a portfolio directory.

## Tech Stack
- Next.js 16 App Router, TypeScript strict
- Prisma v7 + SQLite with better-sqlite3 adapter
- NextAuth.js v5 with GitHub OAuth
- Tailwind CSS v4 with custom editorial design tokens
- Vercel deployment

## Key Conventions
- All server data fetching uses Prisma via `src/lib/prisma/db.ts`
- Server Components by default; `'use client'` only for interactivity
- All forms validate with Zod before server action
- Use `next/font/google` for Inter and JetBrains Mono
- Custom color tokens via `@theme` in `src/app/globals.css`
- `images` and `techStack` in Project model are JSON strings (SQLite limitation) — parse with `JSON.parse()` when reading, `JSON.stringify()` when writing

## Design Tokens (Reference These for All UI Work)
See PRD Section 10 for full palette. Key values:
- `--vibe-bg: #F8F6F3` / `--vibe-bg-dark: #1A1A1A`
- `--vibe-text: #1A1A1A` / `--vibe-text-dark: #E8E6E3`
- `--vibe-accent: #2563EB`
- No box-shadows. Use borders for separation.
- Border radius: 0-4px editorial sharp. Pill (9999px) only on tech stack tags.
- Tailwind classes: `bg-vibe-bg`, `text-vibe-accent`, `border-vibe-border`, etc.

## File Naming
- Components: PascalCase.tsx
- Server actions: `actions.ts` inside the route folder
- Utility functions: camelCase.ts
- Hooks: camelCase.ts prefixed with `use`

## Database
Prisma models: Member, Project, ProjectMember, Editor (singular, PascalCase).
Never use raw SQL. Use Prisma client via `src/lib/prisma/db.ts`.
SQLite does not support `String[]` — `images` and `techStack` are JSON strings.

## Do Not
- Use localStorage or sessionStorage for app state (except dark mode toggle)
- Add inline styles (use Tailwind classes only)
- Use Pages Router patterns
- Suggest external image hosting (local uploads `public/uploads/` for MVP)
- Hardcode color hex values outside of `globals.css`
- Add dependencies without noting justification in the commit
- Import Leaflet or map libraries (not in scope)
