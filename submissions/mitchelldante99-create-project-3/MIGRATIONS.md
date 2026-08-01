# Database Migrations

**Starting fresh?** Use `combined_setup.sql` instead — it's all six
migrations below merged into one file, in the correct order, safe to
paste and run once in a new Supabase project.

**Prefer running them one at a time?** Run these in the Supabase SQL
Editor, **in this exact order**, each as its own "New query". Every file
is safe to re-run if you're not sure whether it already ran
(`if not exists` / `create or replace` throughout).

| Order | File | What it does |
|---|---|---|
| 1 | `schema.sql` | Creates `profiles` and `reviews` tables, base RLS policies |
| 2 | `add-passcode-migration.sql` | Adds passcode hashing, locks down direct update/delete, adds secure insert/update/delete functions |
| 3 | `add-organizer-function.sql` | Adds `organizer_set_hidden` for the Organizer tab's hide/unhide toggle |
| 4 | `add-rate-limiting.sql` | Adds `submission_log` table and rate-limited versions of the insert functions |
| 5 | `add-organizer-passcode-reset.sql` | Adds `organizer_reset_passcode`, so the organizer can help someone who forgot their passcode without ever seeing the original |
| 6 | `add-multi-projects.sql` | Adds the `projects` table so one profile can list multiple projects, each with up to 3 optional links |

After running all six, `index.html` (with your Supabase URL/key filled in)
should work end-to-end: submit, edit, delete, review, report, and organizer
actions.

## If a migration fails

- **"function name is not unique"** — a `create or replace` tried to add
  a new argument to an existing function. Postgres treats different
  argument lists as different functions. Fix: `drop function` the old
  signature first, then re-run.
- **"relation already exists"** — harmless, means that table was already
  created by a previous run. Safe to ignore.
- **RLS warning dialog** — when creating a new table, Supabase may ask
  whether to enable Row Level Security before running. Always choose
  **"Run and enable RLS"** — every table in this project is designed to
  have RLS on.
