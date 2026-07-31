# Project 3 Submission — @CodingWCal

**Calvin V.** · Hult Cohort Developer Program · Summer 2026 · Project 3 (Public showcase platform)

**Production URL:** https://cursor-boston-showcase.vercel.app
**Live site launch date:** July 30, 2026

## Production URL

https://cursor-boston-showcase.vercel.app

## Summary

The **Cursor Boston Showcase** is a production-grade marketing and portfolio site that makes cohort-built projects discoverable to hiring partners, prospective students, and the broader community. It features a curated project gallery, member directory (active/alumni split), full admin CRUD, GitHub OAuth, and dark mode — all served from a single Next.js app with a serverless SQLite database (Turso) hosted on Vercel.

## Architecture summary

- **Framework:** Next.js 16 (App Router) + TypeScript (strict) + React 19 + Tailwind CSS v4 (class-based dark mode).
- **Data:** Prisma v7 ORM on Turso (serverless SQLite via LibSQL driver adapter). Models: `Member`, `Project`, `ProjectMember` (many-to-many join), `User`, `Account`, `Session`, `VerificationToken`, `Editor`.
- **Auth:** NextAuth.js v5 with GitHub OAuth, PrismaAdapter, and an `Editor` model linking authorized users to the admin interface.
- **Admin:** Server actions for create/update/delete with Zod validation; client forms with `useActionState`; delete with confirmation modal.
- **SEO:** Per-page `<title>` templates, OpenGraph meta, viewport with theme-color, sitemap.xml, robots.txt.
- **Deployment:** Vercel (production) with `prisma generate` in the build command; Turso remote database with `prisma db push` for schema sync.
- **Preserved constraints:** SQLite limitation — `String[]` unsupported — `images` and `techStack` stored as JSON strings, parsed client-side.

## Setup steps verified on a fresh clone

```bash
git clone <repo-url>
cd cursor-boston-showcase
npm install
cp .env.local.example .env.local   # fill in Turso URL + GitHub OAuth secrets
npx prisma db push                  # sync schema to your Turso database
npm run dev                         # http://localhost:3000
```

```bash
npm run lint    # 0 errors
npm run typecheck
npm run build   # production build
```

## Motivation / design notes

The design goal was a **curated, editorial-grade showcase** that feels intentional and crafted, not like a generic template:

- **Gradient identity** — Each project card displays a branded gradient fallback with the project's dominant color, giving the grid visual variety and personality without requiring every project to have a hero image.
- **Dark mode** — The site ships with light and dark themes that are manually toggled (not auto/OS-dependent), giving visitors explicit control over their reading experience.
- **Admin-first architecture** — Rather than building a public CRUD and gating it behind roles, the admin interface is a fully separate experience (thin client forms, server actions, GitHub OAuth) so the public site is fast and cacheable.
- **Turso + LibSQL** — Chose Turso (serverless SQLite) over Postgres to avoid cold-start latency and simplify deployment. The `@prisma/adapter-libsql` integration was non-trivial to configure but pays off in zero-infrastructure overhead.

## Known limitations

| Limitation | Context |
|---|---|
| Admin auth is GitHub OAuth only (no email+password, no invite codes) | Each editor must have a GitHub account and be manually linked to an Editor record in the DB |
| No image upload from the admin panel | Images must be hosted externally and pasted as URLs |
| No search or filtering on the public project list | Currently a flat chronological grid |
| No pagination | All projects and members render on a single page; manageable at current scale (~6 projects, ~5 members) |
| No automated E2E tests | Validation relies on manual QA and the build/lint/typecheck pipeline |
| SQLite JSON limitations | `images` and `techStack` stored as JSON strings and parsed client-side rather than using native arrays |

All limitations are tracked in [`BACKLOG.md`](https://github.com/CodingWCal/cursor-boston-showcase/blob/main/BACKLOG.md) in the repo.

## Agent usage summary

This was built end-to-end with **Claude Code (Claude)** across an extended session:

- **Product/planning:** Analyzed the project requirements and the existing cohort submission workflow, designed the schema (8 models), and iterated on the admin/auth architecture.
- **Implementation:** Built the full stack — homepage, project listing/detail, member directory/profile, admin CRUD with server actions, NextAuth v5 GitHub OAuth, dark mode toggle, SEO. Each feature was verified live in the browser.
- **Infra:** Set up Prisma v7 with the LibSQL driver adapter for Turso, configured NextAuth v5 with the PrismaAdapter, deployed to Vercel with the correct build command, seeded the production database with sample content, and linked an Editor record to enable admin sign-in.
- **Migrations:** Migrated from better-sqlite3 (local) to Turso (production) — which required a full adapter change, not just a URL swap. Diagnosed and fixed a dark mode hydration bug (class-based vs. media-query strategy in Tailwind v4). Fixed a Turbopack root warning in `next.config.ts`.
- **QA discipline:** Ran `npm run lint && npm run typecheck && npm run build` before every significant commit. Ran a final QA pass (instructions loaded from `docs/agents/qa.md`) addressing lint errors (3 fixed), adding per-segment `loading.tsx`, fixing `focus-visible` rings, `aria-label`/`aria-hidden` accessibility, and Zod `max()` validations.

## How to review

1. Open https://cursor-boston-showcase.vercel.app — browse the project grid and member directory.
2. Click a project card → full detail with hero image, tech badges, gallery, GitHub/live links.
3. Click a member → profile with bio, social links, and their projects.
4. Toggle dark mode via the sun/moon icon in the header.
5. Navigate to `/admin` → sign in with GitHub (must be an authorized Editor).
6. Once signed in, the admin dashboard shows a project table with create/edit/delete — test the CRUD flow.

CI/CD runs on every push to `main` via Vercel's automatic deployment pipeline.
