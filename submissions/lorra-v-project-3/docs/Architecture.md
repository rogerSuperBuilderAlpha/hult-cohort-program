# Comentiq — MVP Architecture, Schema, User Flows & Build Plan
*Prepared for Cursor-assisted development. Companion to Project_Brief.docx.*

---

## 0. Scope Review — What I'd Cut or Simplify

The brief is unusually thorough, which is good, but a few things will slow an MVP build if taken literally. Recommendations:

| Brief item | Recommendation |
|---|---|
| Momentum Score with 6 dimensions (Building/Sharing/Supporting/Connecting/Learning/Shipping) | Cut for MVP. Track raw contribution events (see `ContributionEvent` below) and compute a single simple score later. Six-dimension scoring needs data you won't have yet. |
| Voice and Perspective System (10 tone profiles × 3 audience versions) | Simplify to 3 tones max (Professional / Conversational / Bold) and generate only Participant + Cohort + Partner versions — that's already in the brief and is enough. Don't build a full tone-profile editor in v1; hardcode the 3 presets. |
| Embeddable widget with light/dark theme + rotating spotlight + admin-managed content | Build as a single static, cacheable JSON-driven `<script>` embed in Priority 5 as planned, but skip theming toggle in v1 — ship dark-only (matches brand), add light mode later. |
| GitHub API integration | Treat as a plain URL field in MVP. Don't call the GitHub API at all until Priority 6 — it adds an OAuth/rate-limit surface for zero MVP value. |
| Campaign Analytics ("Which campaign formats work best" etc.) | Build event logging from day one (cheap), but ship only a simple counts dashboard. Skip cross-dimensional analysis in MVP. |
| 9 AI content formats (LinkedIn, X, Instagram, spotlight, partner summary, roundup, WhatsApp, email, website) | Ship 4 in MVP: LinkedIn post, X post, Instagram caption, Partner summary. These four cover the brief's "Measures of Success" criteria. Add Website Spotlight + Weekly Roundup in Priority 2b once the core loop works. |
| Multi-tenant "Future Community Manager" | Design the schema to be multi-cohort-ready (it already is, via `cohortId` foreign keys) but do **not** build tenant admin UI in MVP. One cohort is enough to prove the model. |

Net effect: same core promise ("individual progress → coordinated story"), roughly 30% less UI surface, and an AI layer that's easy to reason about and cheap to run.

---

## 1. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript | Cursor is very strong with Next.js conventions; server actions remove the need for a separate API layer |
| Styling | Tailwind CSS | Matches brief's visual direction (dark, editorial, high-contrast); fast to iterate |
| Database + Auth + Storage | Supabase (Postgres) | One provider for DB, auth, row-level security, and file storage — minimizes moving parts for an MVP team |
| AI | Anthropic API (Claude) via server actions only | Never called from the client; structured JSON output validated with Zod before saving |
| Hosting | Vercel | Zero-config Next.js deploys, preview URLs per PR |
| Analytics/events | Custom `analytics_events` table (not a third-party tool) | You need per-project, per-campaign breakdowns the brief asks for; a generic analytics SaaS won't give you that without extra plumbing |
| Media | Supabase Storage | Same provider as DB/auth, avoids a fourth vendor |
| Validation | Zod, shared between client forms and server actions | One source of truth for shape of AI output and form data |

This is deliberately close to what the brief suggested — the brief's instincts were right; the main change is picking **one** managed backend (Supabase) instead of mixing providers, so a small team building fast in Cursor isn't juggling five dashboards.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App (Vercel)                    │
│                                                                   │
│  Public routes            Participant dashboard   Admin dashboard│
│  (SSR/ISR, cached)        (auth required)          (admin only)  │
│        │                        │                        │       │
│        └───────────┬────────────┴────────────┬───────────┘       │
│                     │                         │                   │
│              Server Actions / Route Handlers (all writes + AI)    │
│                     │                         │                   │
└─────────────────────┼─────────────────────────┼───────────────────┘
                       │                         │
          ┌────────────▼───────────┐   ┌─────────▼──────────┐
          │   Supabase Postgres     │   │  Anthropic API      │
          │   + Auth + RLS          │   │  (server-side only) │
          │   + Storage (media)     │   └─────────────────────┘
          └─────────────────────────┘
                       │
          ┌────────────▼───────────┐
          │  analytics_events table │
          │  (click/view tracking)  │
          └─────────────────────────┘
```

**Key architectural decisions:**

- **No public API keys client-side.** All AI calls, GitHub metadata fetches (later), and analytics writes happen through Next.js Server Actions or Route Handlers.
- **Row-Level Security (RLS) in Postgres**, not just app-layer checks — a participant can only write their own profile/project rows; the admin role bypasses via a service-role check on the server. This is important because the brief explicitly promises participants control over their own data (Section 19).
- **Public pages are SSR/ISR-cached**, dashboards are client-rendered behind auth — keeps the storytelling-facing site fast (it's the credibility-facing surface) without over-engineering the internal dashboards.
- **AI output is always structured JSON, validated, then stored as *draft* content** — never auto-published. This directly implements the brief's human-in-the-loop requirement (Section 10 & 15).
- **Embeddable widget is a separate, tiny public JSON endpoint** (`/api/widget/[embedKey]`) + a small vanilla-JS snippet — deliberately *not* part of the Next.js app bundle, so it stays fast on third-party sites.

---

## 3. Route & Component Structure

```
app/
├── (public)/
│   ├── page.tsx                     # Home / hero
│   ├── about/page.tsx
│   ├── builders/page.tsx            # Participant directory
│   ├── builders/[slug]/page.tsx     # Participant profile
│   ├── projects/page.tsx            # Project directory (filterable)
│   ├── projects/[slug]/page.tsx     # Project profile
│   ├── campaign/[slug]/page.tsx     # Featured campaign spotlight
│   ├── partners/page.tsx            # Partner-with-us + discovery
│   └── contact/page.tsx
│
├── (auth)/
│   ├── sign-up/page.tsx
│   └── login/page.tsx
│
├── dashboard/                       # Participant, auth required
│   ├── page.tsx                     # Overview
│   ├── profile/page.tsx
│   ├── projects/[id]/page.tsx
│   ├── updates/new/page.tsx         # Submit progress update
│   ├── copilot/[projectId]/page.tsx # AI campaign copilot
│   ├── campaigns/page.tsx           # My campaigns (approve/edit)
│   ├── amplify/page.tsx             # Boost a Builder
│   ├── widget/page.tsx              # Get embed code
│   ├── analytics/page.tsx
│   └── settings/page.tsx
│
├── admin/                           # Admin only
│   ├── page.tsx                     # Cohort overview
│   ├── participants/page.tsx
│   ├── projects/page.tsx
│   ├── briefs/page.tsx              # Weekly project briefs
│   ├── campaigns/page.tsx
│   ├── approvals/page.tsx           # Content approval queue
│   ├── partners/page.tsx            # Partner enquiries
│   ├── analytics/page.tsx
│   └── settings/page.tsx            # Branding, widget defaults
│
├── api/
│   ├── ai/campaign/route.ts         # Server-side Claude call
│   ├── widget/[embedKey]/route.ts   # Public widget JSON
│   ├── track/route.ts               # Analytics event ingestion
│   └── partner-enquiry/route.ts
│
└── actions/                         # Server actions (writes)
    ├── profile.ts
    ├── project.ts
    ├── projectUpdate.ts
    ├── campaign.ts
    ├── amplification.ts
    └── partnerEnquiry.ts

components/
├── ui/            # Buttons, cards, inputs — shared design system
├── public/        # ProjectCard, ParticipantCard, CampaignHero
├── dashboard/      # CopilotPanel, ContentVariantEditor, UpdateForm
├── admin/          # ApprovalQueueRow, AnalyticsSummary
└── widget/         # Standalone embed script (built separately)
```

---

## 4. Database Schema

Designed for Postgres (Supabase). Adds enums, timestamps, and a couple of tables the brief implied but didn't name explicitly (`ContributionEvent`, `ContentVariant` normalized out of `CampaignContent`).

```sql
-- ── Core identity ────────────────────────────────────────────────
create type user_role as enum ('participant', 'admin');

create table users (
  id            uuid primary key default gen_random_uuid(),
  auth_id       uuid unique not null,        -- maps to Supabase auth.users
  name          text not null,
  email         text unique not null,
  role          user_role not null default 'participant',
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Cohort ───────────────────────────────────────────────────────
create type cohort_status as enum ('draft', 'active', 'archived');

create table cohorts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  description   text,
  mission       text,
  tagline       text,
  start_date    date,
  end_date      date,
  branding      jsonb default '{}',          -- colors, logo url, etc.
  status        cohort_status not null default 'draft',
  created_at    timestamptz not null default now()
);

create type profile_status as enum ('incomplete', 'published', 'unpublished');

create table cohort_members (
  id                  uuid primary key default gen_random_uuid(),
  cohort_id           uuid not null references cohorts(id) on delete cascade,
  user_id             uuid not null references users(id) on delete cascade,
  biography           text,
  location            text,
  skills              text[] default '{}',
  interests           text[] default '{}',
  social_links        jsonb default '{}',     -- {linkedin, x, instagram, ...}
  website_url         text,
  github_profile_url  text,
  voice_profile        text default 'professional',  -- enum-lite: professional | conversational | bold
  profile_status      profile_status not null default 'incomplete',
  visible_to_partners boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (cohort_id, user_id)
);

-- ── Projects ─────────────────────────────────────────────────────
create type project_stage as enum ('idea', 'building', 'launched', 'pilot', 'scaling');
create type project_status as enum ('draft', 'published', 'unpublished');

create table projects (
  id               uuid primary key default gen_random_uuid(),
  cohort_id        uuid not null references cohorts(id) on delete cascade,
  owner_id         uuid not null references users(id) on delete cascade,
  name             text not null,
  slug             text not null,
  tagline          text,
  summary          text,
  description      text,
  problem          text,
  solution         text,
  target_audience  text,
  technology_stack text[] default '{}',
  stage            project_stage not null default 'idea',
  live_url         text,
  github_url       text,
  demo_url         text,
  image_url        text,
  needs            text[] default '{}',       -- pilot, mentor, sponsor, ...
  sectors          text[] default '{}',
  status           project_status not null default 'draft',
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (cohort_id, slug)
);

create table project_updates (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects(id) on delete cascade,
  title          text not null,
  description    text not null,
  achievements   text[] default '{}',
  challenges     text[] default '{}',
  lessons        text[] default '{}',
  next_steps     text[] default '{}',
  evidence_links text[] default '{}',
  created_at     timestamptz not null default now()
);

-- ── Campaigns & AI content ──────────────────────────────────────
create type campaign_status as enum ('draft', 'in_review', 'approved', 'published', 'archived');

create table campaigns (
  id             uuid primary key default gen_random_uuid(),
  cohort_id      uuid not null references cohorts(id) on delete cascade,
  project_id     uuid references projects(id) on delete set null,
  project_update_id uuid references project_updates(id) on delete set null,
  creator_id     uuid not null references users(id),
  name           text not null,
  story_angle    text,
  why_angle_matters text,
  audience       text[] default '{}',
  core_message   text,
  evidence       text[] default '{}',
  call_to_action text,
  status         campaign_status not null default 'draft',
  tracking_code  text unique not null,        -- used for UTM-style links
  start_date     date,
  end_date       date,
  created_at     timestamptz not null default now()
);

create type content_channel as enum (
  'linkedin', 'x', 'instagram', 'partner_summary',
  'website_spotlight', 'weekly_roundup'
);
create type content_status as enum ('generated', 'edited', 'approved', 'rejected');

-- Normalized out of the brief's single CampaignContent table so each
-- channel variant can be individually approved/edited without JSON blobs.
create table campaign_content (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  channel       content_channel not null,
  content       text not null,
  status        content_status not null default 'generated',
  approved_by   uuid references users(id),
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (campaign_id, channel)
);

-- ── Amplification ───────────────────────────────────────────────
create type amplification_status as enum ('draft', 'shared');

create table amplifications (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references campaigns(id) on delete cascade,
  participant_id uuid not null references users(id),
  content        text not null,               -- personalized endorsement
  channel        content_channel not null,
  status         amplification_status not null default 'draft',
  clicked_count  integer not null default 0,
  shared_at      timestamptz,
  created_at     timestamptz not null default now()
);

-- ── Widget ───────────────────────────────────────────────────────
create table widgets (
  id                 uuid primary key default gen_random_uuid(),
  cohort_id          uuid not null references cohorts(id) on delete cascade,
  owner_id           uuid references users(id) on delete cascade, -- null = cohort-level widget
  active_campaign_id uuid references campaigns(id) on delete set null,
  embed_key          text unique not null,
  status             text not null default 'active',   -- active | disabled
  created_at         timestamptz not null default now()
);

-- ── Analytics ────────────────────────────────────────────────────
create type analytics_event_type as enum (
  'profile_view', 'project_view', 'campaign_view',
  'link_click', 'widget_click', 'share_action',
  'amplification_action', 'partner_enquiry_submitted'
);

create table analytics_events (
  id           uuid primary key default gen_random_uuid(),
  cohort_id    uuid references cohorts(id) on delete cascade,
  project_id   uuid references projects(id) on delete set null,
  campaign_id  uuid references campaigns(id) on delete set null,
  widget_id    uuid references widgets(id) on delete set null,
  event_type   analytics_event_type not null,
  source       text,                        -- e.g. 'linkedin', 'widget', 'direct'
  referrer     text,
  metadata     jsonb default '{}',
  created_at   timestamptz not null default now()
);

-- ── Partner enquiries ────────────────────────────────────────────
create type enquiry_status as enum ('new', 'in_progress', 'closed');

create table partner_enquiries (
  id             uuid primary key default gen_random_uuid(),
  cohort_id      uuid not null references cohorts(id) on delete cascade,
  project_id     uuid references projects(id) on delete set null,
  participant_id uuid references users(id) on delete set null,
  organization   text,
  contact_name   text not null,
  email          text not null,
  interest_type  text not null,             -- pilot, sponsor, mentor, hire, invest...
  message        text,
  status         enquiry_status not null default 'new',
  created_at     timestamptz not null default now()
);

-- ── Contribution tracking (lightweight, replaces the 6-dim Momentum Score for MVP) ─
create table contribution_events (
  id             uuid primary key default gen_random_uuid(),
  cohort_id      uuid not null references cohorts(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  event_type     text not null,     -- update_published | amplification | partner_intro | ...
  reference_id   uuid,              -- polymorphic pointer (project_update, amplification, etc.)
  created_at     timestamptz not null default now()
);
```

**RLS notes for Cursor to implement:**
- `users`: a row is readable/writable only by its own `auth_id`, except admins.
- `cohort_members`, `projects`, `project_updates`: writable only by `owner_id = auth.uid()` or an admin of that cohort; readable publicly only when `status = 'published'`.
- `campaign_content`: writable by the campaign's creator or an admin; never publicly readable (approved content gets copied into public project/campaign pages, not exposed as raw rows).
- `analytics_events`: insert-only from server, no client reads except via aggregated admin queries.

---

## 5. Primary User Flows

### 5.1 Participant — Profile to Amplified Campaign
```
Sign up → Join cohort → Complete profile → Add project
   → Submit weekly update
        → [AI] analyze update → propose story angle
        → [AI] generate content variants (LinkedIn / X / IG / Partner)
   → Edit & approve variants → Save as campaign (status: approved)
   → Project + campaign appear in public showcase
   → Other participants amplify (generate personalized endorsement → share)
   → Clicks/views tracked via campaign tracking_code
   → Partner clicks through → submits enquiry
   → Participant + admin notified
```

### 5.2 Administrator — Weekly Cohort Campaign
```
Create cohort → set branding/mission → add weekly brief
   → Review incoming participant projects/updates
   → View suggested campaign stories (surfaced from recent project_updates)
   → Create cohort-wide campaign → select featured project(s)
        → [AI] generate cohort-voice content variants
   → Approve campaign → mark published
   → Participants see "amplify this" prompt in dashboard
   → Campaign appears on public site + widget feed
   → Review analytics + partner enquiries
```

### 5.3 Partner — Discovery to Enquiry
```
Land on public site → read cohort proposition
   → Browse "Explore Projects" → filter by sector/stage/need
   → Open project profile → review evidence (updates, links, stage)
   → Submit "Express interest" form (interest_type + message)
   → Enquiry stored → admin (and project owner) notified
   → Admin follows up outside the platform (email/call)
```

### 5.4 Content Approval (cuts across 5.1 / 5.2)
```
AI generates draft content (status: generated)
   → User/admin edits inline (status: edited)
   → User/admin approves (status: approved, approved_by/at set)
   → Only approved content is copyable/publishable/shown in dashboard "ready" list
   → Rejected content stays saved but excluded from campaign output
```

---

## 6. AI Layer

- **Trigger**: participant submits a `project_update`, or admin selects a project for a cohort campaign.
- **Input assembled server-side**: project fields + latest update + cohort mission + selected voice profile.
- **Output contract** (Zod-validated before insert):

```ts
const CampaignOutputSchema = z.object({
  story_angle: z.string(),
  why_this_angle_matters: z.string(),
  audience: z.array(z.string()),
  core_message: z.string(),
  evidence: z.array(z.string()),
  call_to_action: z.string(),
  linkedin_post: z.string(),
  x_post: z.string(),
  instagram_caption: z.string(),
  partner_summary: z.string(),
  campaign_tags: z.array(z.string()),
});
```

- **System behavior** (from brief Section 15, used near-verbatim as the system prompt): evidence-based, no invented traction, preserve voice, explain why the angle was chosen, human approval required before anything is marked "ready."
- **Deterministic vs AI-assisted** (explicit split for Cursor):
  - **AI-assisted**: story angle selection, copy generation, amplification endorsement drafts, recommended amplifiers (simple heuristic: same sector/cohort, hasn't amplified this campaign yet — not ML in MVP).
  - **Deterministic**: analytics counts, campaign tracking codes, contribution event logging, partner enquiry routing, profile completeness checks.

---

## 7. Security & Privacy Risks to Address Early

1. **AI key exposure** — enforce all Claude calls through server actions/route handlers; add a lint rule or code review checklist item banning `ANTHROPIC_API_KEY` in any client component.
2. **RLS gaps** — write RLS policy tests (a participant cannot read/write another participant's draft content) before Priority 2 ships.
3. **Widget as an open endpoint** — `embed_key` should be a long random token, rate-limited, and return only already-public campaign data (never draft content).
4. **Partner enquiry form** — public-facing input; validate/sanitize server-side, rate-limit submissions to prevent spam.
5. **Unpublish/delete rights** — implement "unpublish project," "disable widget," "remove social links" as real, working actions in Priority 1–2, not deferred — the brief promises this explicitly in Section 19 and it's a trust feature, not a nice-to-have.
6. **No covert tracking** — analytics events should only fire on actions described to the user (page views, clicks, shares); document this in a short privacy note on the public site.

---

## 8. Phased Build Plan

Each phase lists scope, key acceptance criteria, and a rough size (assuming 1–2 developers working in Cursor).

### Phase 1 — Foundation (identity + showcase skeleton)
**Scope:** Auth (sign-up/login via Supabase Auth), `users`/`cohorts`/`cohort_members`/`projects` tables + RLS, profile creation, project creation, public directory + profile pages.
**Acceptance criteria:**
- A participant can sign up, complete a profile, and add a project with all required fields.
- Published profiles/projects appear on public directory pages; unpublished ones don't.
- Admin can view all participants/projects in `/admin`.
**Size:** ~1.5–2 weeks.

### Phase 2 — Project Updates + AI Campaign Copilot
**Scope:** `project_updates`, `campaigns`, `campaign_content` tables; update submission form; Claude integration behind a server action; content editor UI with approve/reject.
**Acceptance criteria:**
- Submitting an update triggers AI generation of the 4 core content variants within the defined JSON contract.
- User can edit any variant inline and mark it approved.
- Approved campaign + project appear together on the public project page.
**Size:** ~2 weeks.

### Phase 3 — Amplification
**Scope:** `amplifications` table, "Boost a Builder" flow, personalized endorsement generation, copy/share action, `contribution_events` logging.
**Acceptance criteria:**
- A participant can select another's approved campaign and get a personalized (not duplicated) endorsement draft.
- Amplification actions are recorded and visible in the amplifier's dashboard.
**Size:** ~1 week.

### Phase 4 — Partner Discovery + Enquiries
**Scope:** Filterable project directory (sector/stage/need), project "needs" display, `partner_enquiries` table + form, admin enquiry review queue.
**Acceptance criteria:**
- A visitor can filter projects by at least sector, stage, and need.
- Submitting an enquiry creates a record visible to admin and notifies the relevant participant.
**Size:** ~1 week.

### Phase 5 — Embeddable Widget
**Scope:** `widgets` table, `/api/widget/[embedKey]` public JSON endpoint, standalone embed script, click tracking into `analytics_events`.
**Acceptance criteria:**
- Embed code installs on a static test page and renders the current featured campaign.
- Widget clicks are recorded and attributable to the correct widget/campaign.
**Size:** ~1 week.

### Phase 6 — Analytics, Dashboard Polish, Visual Identity Pass
**Scope:** `analytics_events` aggregation views/queries, participant + admin analytics pages, full visual design pass per Section 14 (dark theme, Sora/Manrope-inspired type, motion), empty/loading/error states across all dashboards, seed/demo dataset.
**Acceptance criteria:**
- Admin can see, per cohort: top projects by views, top campaigns by clicks, partner enquiry counts.
- Public site matches the brand direction (dark, editorial, high-contrast CTAs) and passes a basic accessibility check (contrast, keyboard nav, alt text).
- A realistic demo dataset (5–8 participants, 5–8 projects, a few campaigns and enquiries) is seeded for demo day.
**Size:** ~1.5–2 weeks.

**Total estimate: ~8–10 weeks** for a small team, sequenced to always leave a demonstrable product at the end of each phase — which matters given the brief's "Measures of Success" are really a checklist of exactly these phase outputs.

---

## 9. Suggested Demo Seed Data

- 1 cohort ("Hult Summer Cohort — 2026") with branding/mission filled in.
- 6 participants across varied sectors (EdTech, Climate, Healthtech, Creative, Productivity, AI tooling), each with a complete profile and one project at a different `stage`.
- 2–3 project updates per project, spanning a few weeks, with real-sounding (but fictional) achievements/challenges.
- 4–5 approved campaigns with all content variants filled in, 2 marked `featured`.
- 6–10 amplification records across participants.
- 8–12 analytics events per project (mix of view/click types) so the analytics dashboard isn't empty on demo day.
- 2–3 partner enquiries in different statuses (`new`, `in_progress`, `closed`).

---

*This document is meant to be dropped into the repo (e.g. `/docs/architecture.md`) and referenced directly in Cursor prompts when scaffolding each phase.*
