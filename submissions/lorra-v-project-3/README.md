# Comentiq

**Where individual brilliance becomes collective momentum.**

Comentiq turns individual builders' project progress into coordinated,
evidence-based stories — AI-assisted campaign content, peer
amplification, and partner discovery — for a cohort of founders
building in public together.

Built for the Hult Cohort Developer Program, Summer Pilot 2026,
Phase 1 Project 3.

## Production

**Live app:** https://hult-cohort-program-one.vercel.app

## What it does

- Builders create a profile and one or more projects, and publish them
  to a public showcase.
- Submitting a project update triggers an AI Campaign Copilot
  (Claude, server-side) that proposes a story angle and drafts content
  for four channels — LinkedIn, X, Instagram, and a partner-facing
  summary — grounded only in evidence the builder supplied. Every
  piece of AI-generated content is a draft until a human edits and
  approves it.
- Approved content appears on the builder's public project page.
- Other builders can "Boost" an approved campaign — the AI drafts a
  personalized peer endorsement, which the amplifier edits and shares.
- Partners can browse the public showcase and submit an enquiry
  (pilot interest, mentorship, sponsorship, etc.), which an admin
  reviews and tracks through a simple status pipeline.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres, Auth, Storage, Row-Level Security) · Anthropic API (Claude)
· Zod · Vercel

## Setup — run locally from a clone

1. **Clone this fork** and move into the project folder:
   ```
   git clone https://github.com/Lorra-V/hult-cohort-program.git
   cd hult-cohort-program/submissions/lorra-v-project-3
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Create a Supabase project** at [supabase.com](https://supabase.com),
   then copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY` (from [console.anthropic.com](https://console.anthropic.com))
   - `ADMIN_EMAILS` (comma-separated emails that should get admin access)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

4. **Run the database migrations.** In the Supabase SQL Editor, paste
   and run each file in `supabase/migrations/` in order:
   `001_schema.sql` → `002_storage.sql` →
   `003_partner_enquiry_links.sql` → `004_amplifications_public_read.sql`

5. **Configure Supabase Auth redirect URLs** (Authentication → URL
   Configuration): add `http://localhost:3000/auth/callback` to
   Redirect URLs.

6. **(Optional) Seed demo data:**
   ```
   npm run seed
   ```
   Creates 6 fictional builders with published profiles, projects,
   updates, approved campaigns, amplifications, and partner enquiries.
   Only runs against `localhost` — guarded against accidental
   production use.

7. **Run the app:**
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

These steps reflect the actual setup performed during development
(Supabase project creation, env vars, migrations in order, auth
config) but have not been independently re-verified against a
completely fresh clone.

## Documentation

- [`docs/Architecture.md`](docs/Architecture.md) — full architecture,
  database schema, user flows, and phased build plan
- [`docs/Cursor_Agent_Prompt.md`](docs/Cursor_Agent_Prompt.md) — the
  phased build prompt used to drive development in Cursor
- [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — agent
  instruction files used during development
