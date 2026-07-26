# Project 2 Submission — @arjun-singh2127

Link UP is a Discord-style communication platform. Spaces are **Groups**,
channels inside them are **Links**, and direct messages are **Personal
Links**. It covers the full comms baseline — public channels with
create/rename/archive, 1:1 DMs, 30-day message persistence, admin-only
announcement channels, in-app notifications on @mention or DM, and keyword
message search — plus image attachments, Google sign-in, realtime delivery,
and public discoverable Groups.

## Production URL

**https://comms-arjun-singh2127.vercel.app**

- Source repository: https://github.com/arjun-singh2127/comms-arjun-singh2127
- The cohort space is the public **Link UP HQ** Group (visible on the home
  grid after sign-in, one-click join): `#general`, `#help`, `#random`, and the
  admin-only `#announcements`.

Open registration is enabled — reviewers can create an account with any email
+ password (or Google) from the login screen, with no admin or database
steps. **Use the same email as your PM platform account** so identities match
across apps.

## Baseline coverage

- **Channels:** Links inside Groups; ≥ 3 public channels live in the public
  Link UP HQ Group. Admins can create, rename, and archive Links (archived
  Links keep history but reject new posts — enforced in RLS, mirrored in UI).
- **Direct messages:** Personal Links between any two members, started by
  email address.
- **Persistence:** messages and images survive refresh and are retained for
  30 days (scheduled cleanup via a Supabase Edge Function + `pg_cron`).
- **Announcements:** announcement-kind Links accept posts only from Group
  owners/admins (database-level policy, not just UI).
- **Notifications:** a Postgres trigger creates in-app notifications on every
  DM and on @mentions in group Links; a realtime-updated unread badge sits in
  the navigation rail, with a notifications page that deep-links into the
  conversation.
- **Search:** keyword search across all conversations the user can access
  (RLS scopes results automatically), deep-linking into the matching Link or
  Personal Link.
- **Multi-user auth:** Supabase Auth (email/password + Google OAuth); open
  registration supports the 30-account requirement; **PM email match** is
  satisfied by signing up with the same email used on the PM platform
  (Helm — https://helm-web-neon.vercel.app).
- **Deployment:** public HTTPS URL on Vercel (above).

## Setup steps verified on fresh clone

```bash
git clone https://github.com/arjun-singh2127/comms-arjun-singh2127.git
cd comms-arjun-singh2127
npm install
cp .env.example .env.local    # Windows: copy .env.example .env.local
# fill in the Supabase URL + keys, then run the three files in
# supabase/migrations/ (in order) in the Supabase SQL editor
npm run dev                   # app on :3000
```

Verified: the production build (`npm run build`) passes type-checking and
lint; the schema and RLS policies were applied to the hosted Supabase
project; sign-up (email + Google), Group create/join (invite code and public
one-click join), Link create/rename/archive, announcement posting
restrictions, realtime message + image delivery, mention/DM notifications,
and keyword search all work against the production deployment.

## Architecture summary

- **Framework:** Next.js 14 App Router + TypeScript + Tailwind. Server
  components fetch data; server actions handle mutations; `src/middleware.ts`
  refreshes Supabase sessions and guards `/app` routes.
- **Platform:** Supabase — Postgres, Auth, Realtime, Storage. The browser
  subscribes to `postgres_changes` for live messages and notification badges
  (send → appear well under 2 s; no polling).
- **Security:** Row Level Security on every table and storage bucket.
  Membership checks live in `SECURITY DEFINER` helpers in a private schema
  (no RLS recursion); group create/join and DM initiation are `SECURITY
  DEFINER` RPCs granted only to `authenticated`. Announcement/archive posting
  rules are enforced in the message INSERT policy itself.
- **Notifications:** an `AFTER INSERT` trigger on `messages` fans out
  notification rows (DM partner, @mentioned group members); notifications are
  readable/markable only by their owner.
- **Retention:** a Supabase Edge Function deletes messages and storage
  objects older than 30 days, scheduled daily with `pg_cron` + `pg_net`.
- **Key files:** `supabase/migrations/0001_init.sql` (schema + RLS),
  `0003_project2_baseline.sql` (announcements, archiving, public groups,
  notifications), `src/components/chat/ChatPane.tsx` (realtime),
  `src/lib/actions/` (server actions).

## PM platform integration notes

Helm (Project 1, Express + Prisma + JWT) and Link UP (Supabase Auth) keep
separate auth stacks; the cohort requirement is met via **matching emails** —
each member signs up on both apps with the same email address. Link UP's
data model (groups/links/messages/notifications) is fully independent from
the PM platform's tables, so nothing collides.

## Known limitations

- Notifications are in-app only (no email delivery yet).
- @mention matching is display-name substring based; there is no mention
  autocomplete yet, and people with overlapping names may both be notified.
- Search is keyword `ILIKE` matching (no full-text ranking) and only covers
  the 30-day retention window, by design.
- No reply threads, reactions, or presence indicators yet.
- No automated end-to-end (browser) test suite; verification is manual smoke
  testing plus build-time type-checking and lint.

## Agent usage summary

- **Research:** the agent read the Project 2 requirements, review rubric, and
  submission conventions on the cohort repo to align scope.
- **Dev:** the agent built the app end to end — schema and RLS design,
  auth (email + Google OAuth with PKCE), Groups/Links/Personal Links,
  realtime chat with image attachments, announcement Links, notifications
  (trigger + realtime badge), keyword search, public Groups, Link
  rename/archive, the retention Edge Function, and the Vercel deployment
  config — plus `AGENTS.md`, `LICENSE`, and this submission artifact.
- **QA:** the agent fixed a session-revocation bug (middleware placement +
  reducing redundant token checks) and a stale-chat-state bug found during
  manual testing.
- **Human direction:** the builder provisioned Supabase and Google OAuth,
  ran all shell/deploy commands, executed the smoke tests, and made product
  and design decisions (naming, theme, home-grid layout).
