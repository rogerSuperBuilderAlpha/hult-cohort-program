# Cursor Agent Prompt — Comentiq (Hult Cohort Program, Project 3)

You are my build agent for the Hult Cohort Developer Program Summer Pilot 2026 — Project 3: a vibe marketing platform for the cohort.

**Product:** Comentiq — "Where individual brilliance becomes collective momentum." It turns individual participants' project progress into coordinated stories, AI-generated campaign content, peer amplification, and partner discovery for the Hult Summer Cohort.

**Hard deadline:** The submission PR must be merged by **Sunday 5:00 PM Eastern**. Today is Tuesday. We build in three phases with HARD STOPS between them:

- **Phase A — Build and verify everything on localhost.** Do not deploy. Do not touch the submission repo.
- **Phase B — Deploy to Vercel and verify production.** Target: complete by Saturday night, not Sunday.
- **Phase C — Prepare the submission folder and open the PR.**

Do NOT proceed past a phase boundary until I explicitly say so. Within Phase A, stop at every ✅ CHECKPOINT and wait for my confirmation before continuing.

---

## Rules of engagement

1. **Stack (fixed, do not substitute):** Next.js 14+ App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth + RLS + Storage), Anthropic API (Claude) for content generation, Zod for all validation. Deploy target is Vercel.
2. **SQL migrations:** Write every migration as a numbered file in `supabase/migrations/` (`001_schema.sql`, `002_...`), but I apply them **manually via the Supabase SQL Editor**. Never assume a `DATABASE_URL` connection, never run migrations programmatically, never use the Supabase CLI db push. When a migration is needed, output the full SQL and tell me to paste it into the SQL Editor, then wait.
3. **Secrets:** All Anthropic calls and privileged Supabase operations happen in Server Actions or Route Handlers only. `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never appear in any client component or be prefixed `NEXT_PUBLIC_`. If you ever need a secret client-side, stop and tell me instead.
4. **Security lessons from my last two builds — bake these in from the start, not as fixes later:**
   - RLS on any profile/role table must prevent a user from updating their own `role` or privileged status columns. Use a `BEFORE UPDATE` trigger or column-level protection, not just a permissive `update own row` policy. (This exact privilege-escalation hole was flagged by a peer reviewer on my Project 2.)
   - No `/api/dev/` or debug endpoints reachable in production. If you create any dev-only route, gate it in middleware to non-production environments.
   - Admin access is controlled by an `ADMIN_EMAILS` environment variable, re-checked on every auth callback when ensuring the profile row exists — not by a self-editable database flag.
5. **Human-in-the-loop AI:** Generated content is always saved as a draft. Nothing is marked approved without an explicit user action. The AI must never invent traction, users, revenue, or results — it works only from evidence the participant supplied.
6. **Quality bar for the UI:** Peers review this by clicking around the live site. Clean, navigable, visually confident UI matters as much as features. Public pages: dark/deep-neutral background, bright accent colors, large editorial typography (Sora for headings, Inter for body), generous spacing, high-contrast CTAs, strong project cards. It should feel like a movement and an editorial site, not a SaaS admin panel. Dashboards can be more functional but keep the same brand energy.
7. **Every page** gets a designed empty state, a loading state, and an error state. No raw unstyled error dumps, no blank white screens.
8. **Keep dependencies minimal.** Next.js, Tailwind, Supabase JS, Anthropic SDK, Zod, and small utilities only. No component mega-libraries, no ORM.
9. **Ask before assuming.** If a step is ambiguous, ask me one concise question rather than guessing and building the wrong thing.

---

## Environment variables

Create `.env.local` (never committed) with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ADMIN_EMAILS=lorrainevillaroel@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Also create `.env.example` with the same keys and empty values, which IS committed.

---

## MVP scope for this sprint

**In scope:** auth (participant + admin roles), participant profiles, project profiles, public showcase (home, builders directory, projects directory, individual pages), project updates, AI Campaign Copilot (4 content variants: LinkedIn post, X post, Instagram caption, partner summary) with edit + approve flow, Boost a Builder (personalized AI endorsement of another participant's approved campaign), partner enquiry form + admin enquiries view, raw analytics event logging (views/clicks written to a table — no dashboard).

**Explicitly OUT of scope (do not build, do not stub UI for):** embeddable widget, analytics dashboards/aggregation UI, voice-profile selection (hardcode one credible professional-but-human tone), admin campaign creation, weekly briefs, GitHub API integration (GitHub URLs are plain links), momentum scores, any direct social posting or OAuth to social platforms. These go in the PR's Known Limitations.

---

# PHASE A — Localhost build

## Step 1 — Scaffold

Create the Next.js app (App Router, TypeScript, Tailwind, ESLint) in the current folder. Set up:

- Route groups: `(public)`, `(auth)`, `dashboard/`, `admin/`
- `lib/supabase/` with separate browser client, server client, and service-role client (service-role used only in server actions that require it)
- Tailwind theme tokens for the brand: deep neutral background (near-black with a slight warm or blue cast — pick one and commit to it), 2–3 bright accent colors, Sora (headings) + Inter (body) via `next/font/google`
- A base layout with header/footer for public pages; footer includes the line "Collective momentum, intelligently amplified."
- Shared UI primitives in `components/ui/`: Button, Card, Input, Textarea, Select, Badge, EmptyState, Spinner

✅ CHECKPOINT 1: `npm run dev` renders a styled placeholder home page with the brand fonts and colors. Stop and show me.

## Step 2 — Database migration 001

Output `supabase/migrations/001_schema.sql` containing, in this order: extensions if needed, enums, tables, indexes, RLS enablement, and RLS policies. Schema:

**Enums:** `user_role` (participant, admin) · `profile_status` (incomplete, published, unpublished) · `project_stage` (idea, building, launched, pilot, scaling) · `project_status` (draft, published, unpublished) · `campaign_status` (draft, approved, archived) · `content_channel` (linkedin, x, instagram, partner_summary) · `content_status` (generated, edited, approved, rejected) · `amplification_status` (draft, shared) · `analytics_event_type` (profile_view, project_view, campaign_view, link_click, share_action, amplification_action, partner_enquiry_submitted) · `enquiry_status` (new, in_progress, closed)

**Tables:**

- `profiles` — id (uuid, PK, references `auth.users`), name, email, role (`user_role`, default participant), avatar_url, biography, location, skills text[], interests text[], social_links jsonb, website_url, github_profile_url, profile_status, visible_to_partners boolean default true, created_at, updated_at
- `cohorts` — id, name, slug unique, description, mission, tagline, start_date, end_date, status text default 'active', created_at. (Single cohort in practice, but keep the FK structure.)
- `projects` — id, cohort_id FK, owner_id FK → profiles, name, slug, tagline, summary, description, problem, solution, target_audience, technology_stack text[], stage, live_url, github_url, demo_url, image_url, needs text[], sectors text[], status (`project_status` default draft), featured boolean default false, created_at, updated_at, unique(cohort_id, slug)
- `project_updates` — id, project_id FK, title, description, achievements text[], challenges text[], lessons text[], next_steps text[], evidence_links text[], created_at
- `campaigns` — id, cohort_id FK, project_id FK, project_update_id FK nullable, creator_id FK, name, story_angle, why_angle_matters, audience text[], core_message, evidence text[], call_to_action, status (`campaign_status` default draft), tracking_code text unique, created_at
- `campaign_content` — id, campaign_id FK, channel, content, status (`content_status` default generated), approved_by FK nullable, approved_at, created_at, unique(campaign_id, channel)
- `amplifications` — id, campaign_id FK, participant_id FK, content, status (`amplification_status` default draft), shared_at, created_at
- `analytics_events` — id, cohort_id, project_id nullable, campaign_id nullable, event_type, source, referrer, metadata jsonb, created_at
- `partner_enquiries` — id, cohort_id FK, project_id FK nullable, participant_id FK nullable, organization, contact_name, email, interest_type, message, status (`enquiry_status` default new), created_at

**RLS (enable on every table):**

- `profiles`: anyone can read rows where `profile_status = 'published'`; a user can read and update their own row — but add a `BEFORE UPDATE` trigger that blocks changes to `role` unless performed by service role. Insert handled by the auth-callback ensure-profile server action (service role).
- `projects` / `project_updates`: public read only when the project is `published`; owner can insert/update/delete their own; admins full access via service role in server actions.
- `campaigns` / `campaign_content`: readable by their creator; `campaign_content` rows with `status = 'approved'` on a campaign whose project is published are publicly readable (approved content appears on public pages); writes by creator only.
- `amplifications`: participant can insert/read their own; campaign creator can read amplifications of their campaigns.
- `analytics_events`: insert via server only (no anon insert policy — writes go through a route handler using service role); no client reads.
- `partner_enquiries`: insert via server route handler (service role); reads restricted to admins (service role in admin server components).

Also include: an `updated_at` trigger function applied to profiles and projects, and a seed insert for the cohort row (name "Hult Summer Cohort 2026", slug `hult-summer-2026`, tagline "Where individual brilliance becomes collective momentum.").

Then STOP and tell me to paste 001 into the Supabase SQL Editor.

✅ CHECKPOINT 2: I confirm the migration ran clean.

## Step 3 — Auth + profile bootstrap

- Email/password sign-up and login via Supabase Auth (magic link optional if trivial; skip social OAuth entirely this sprint).
- On every auth callback, an `ensureProfileForUser` server function: creates the `profiles` row if missing, and sets `role = 'admin'` iff the email is in `ADMIN_EMAILS` (re-evaluated every login — an email removed from the list loses admin next login).
- Middleware: `/dashboard/*` requires auth; `/admin/*` requires auth + admin role (checked server-side, not from client state).
- Auth pages styled to brand; friendly error messages.

✅ CHECKPOINT 3: I can sign up, log in, see an (empty) dashboard; my email gets admin; a second test account does not.

## Step 4 — Profile + project management (dashboard)

- `dashboard/profile` — form for all profile fields (skills/interests as tag inputs, social links as labeled URL fields). Zod validation shared client/server. Publish/unpublish toggle. Avatar upload to Supabase Storage (public bucket `avatars`), with a graceful fallback to initials if none.
- `dashboard/projects` — list my projects + create/edit form covering all project fields (needs and sectors as multi-select from fixed lists below), image upload to bucket `project-media`, publish/unpublish, slug auto-generated from name (editable, uniqueness-checked).
- Fixed lists — sectors: Education, Community Development, Healthcare, Finance, Creative Industries, Climate, Tourism, Public Services, Productivity, Workforce Development, AI, Software Development. Needs: Pilot organization, Technical collaborator, Industry mentor, Early users, Data partner, Sponsor, Investor, Media coverage, Research partner, Distribution partner.

✅ CHECKPOINT 4: Full profile + one project created and published from the UI.

## Step 5 — Public showcase

- **Home** — hero with the headline "Where individual brilliance becomes collective momentum.", supporting copy, CTAs: Explore the Projects / Meet the Builders / Discover Partnership Opportunities. Visual: an abstract animated network of glowing nodes connecting (CSS/SVG animation — subtle, performant, no heavy libraries; static-but-beautiful is acceptable if animation gets fiddly). Below the hero: featured projects row, latest builders row.
- **/builders** — directory of published profiles as editorial cards (photo, name, location, one-line bio, skills badges).
- **/builders/[slug]** — full profile: bio, skills, links, their published projects, their approved campaign content (rendered as story cards), an "Express interest in working with [name]" CTA linking to the partner form pre-filled.
- **/projects** — directory of published projects as strong editorial cards (image, name, tagline, stage badge, sector badges, needs). If time allows later, filters — do not build filters now.
- **/projects/[slug]** — the flagship page: hero (image, name, tagline, stage), problem/solution/audience sections, tech stack, links (live/GitHub/demo), progress updates timeline, approved campaign story content, "what this project needs next" panel, partner interest CTA.
- Page-view logging: on server render of profile/project pages, fire an insert to `analytics_events` via a server function (profile_view / project_view). Never block rendering on it.
- These pages must look genuinely good. Spend effort here.

✅ CHECKPOINT 5: Showcase browsable end to end with my seeded profile/project. Stop for my visual review — I will request design adjustments before we continue.

## Step 6 — Project updates

- `dashboard/updates/new` (or nested under the project): form for title, description, achievements, challenges, lessons, next steps, evidence links (repeatable inputs).
- Updates appear on the public project page as a timeline, newest first.

✅ CHECKPOINT 6: An update submitted from the UI shows on the public project page.

## Step 7 — AI Campaign Copilot

The differentiator — get this right.

- Route: `dashboard/copilot` — pick one of my projects, pick one of its updates (default: latest), press **Generate campaign**.
- Server action assembles context: project fields + the chosen update + cohort mission/tagline. Calls the Anthropic API (model: `claude-sonnet-4-6`, server-side only) with this system behavior:

  > You are a campaign strategist for a community of builders. Identify the clearest, most credible, and most engaging story within the supplied project information. Use evidence rather than hype. Preserve the participant's voice while connecting the work to the wider momentum of the cohort. Never invent users, revenue, partnerships, results, or capabilities not present in the supplied material. Distinguish completed work from planned work. Avoid generic filler phrases, excessive emojis, and exaggerated claims. Each channel's content must be written for that channel, not copied across. Respond ONLY with a JSON object matching the requested schema — no preamble, no markdown fences.

- Requested JSON schema (validate with Zod; on parse failure, retry once with the error appended, then surface a friendly error):

```ts
const CampaignOutputSchema = z.object({
  story_angle: z.string(),
  why_this_angle_matters: z.string(),
  audience: z.array(z.string()),
  core_message: z.string(),
  evidence: z.array(z.string()),
  call_to_action: z.string(),
  linkedin_post: z.string(),
  x_post: z.string().max(1100), // threads allowed; keep sane
  instagram_caption: z.string(),
  partner_summary: z.string(),
  campaign_tags: z.array(z.string()),
});
```

- On success: create the `campaigns` row (tracking_code = short random slug) + four `campaign_content` rows (status `generated`).
- **Review UI:** show story angle + "why this angle" prominently, then the four variants as editable cards. Per variant: edit inline (status → `edited`), Approve (status → `approved`, sets approved_by/at), Reject. A **Copy** button per approved variant.
- Approving at least one variant sets the campaign to `approved`; approved content then renders on the public project page. Loading state during generation (it takes several seconds) — a branded "finding your strongest story…" state, not a frozen button.

✅ CHECKPOINT 7: Full loop verified: update → generate → edit → approve → content visible on the public project page. I will read the generated copy quality closely here.

## Step 8 — Boost a Builder (amplification)

- `dashboard/amplify` — grid of other participants' approved campaigns (never my own). Select one → server action calls Claude to draft a **personalized endorsement** in my voice, grounded in: my profile bio/skills, the target campaign's story angle and evidence, and the shared-cohort context. It must read like a genuine peer endorsement (e.g., building alongside them in the cohort), must not duplicate the original campaign copy, and must not invent shared history beyond cohort membership.
- Editable before use. **Copy & mark shared** sets status `shared` + `shared_at`, and logs an `amplification_action` analytics event.
- Public project pages show an amplification count ("Boosted by N cohort builders") when > 0.

✅ CHECKPOINT 8: Second test account amplifies my campaign; count appears publicly.

## Step 9 — Partner enquiries

- Public `/partners` page: short cohort pitch for partners + the enquiry form (organization, contact name, email, interest type from the needs list + "General", optional project/participant selector, message). Submits to a route handler (service role insert), server-side Zod validation, simple rate limit (per-IP, in-memory is fine for MVP), logs `partner_enquiry_submitted`. Branded success state.
- Project and builder pages' "express interest" CTAs deep-link here with the project/participant pre-selected.
- `admin/enquiries` — table of enquiries, newest first, status toggle (new / in_progress / closed), detail view. Admin also gets `admin/overview` with simple counts (participants, published projects, campaigns, amplifications, enquiries) — plain queries, no charts.

✅ CHECKPOINT 9: Logged-out enquiry submission appears in the admin view.

## Step 10 — Seed data + polish sweep

- `scripts/seed.ts` (run with service role, local only): 6 fictional participants across sectors (Education, Climate, Healthtech, Creative, Productivity, AI tooling), each with a complete published profile, 1 published project at a distinct stage, 2–3 substantive updates, 1–2 approved campaigns with realistic (clearly fictional) content, cross-amplifications between them, 3 partner enquiries in mixed statuses, and a scatter of analytics events. Names/companies obviously fictional; no real people.
- Sweep: every route's empty/loading/error states, mobile responsiveness on all public pages, keyboard/focus accessibility on forms, alt text, no console errors, `npm run build` passes clean.

✅ CHECKPOINT 10 — END OF PHASE A: Full demo walkthrough on localhost with seed data. **HARD STOP. Do not start Phase B until I say go.**

---

# PHASE B — Deploy (target: done Saturday night)

1. Pre-flight: confirm no secrets in client bundles (search for the env var names in `.next` client chunks), no dev/debug routes without production gating, `.env.local` gitignored, `npm run build` clean.
2. I create the Vercel project and set env vars (`NEXT_PUBLIC_SITE_URL` → production URL). Walk me through each setting; list every env var explicitly.
3. Supabase production config: add the Vercel domain to Auth redirect URLs / site URL. Remind me to re-run all migrations in the **production** Supabase project via SQL Editor if it's a separate project, and to run the seed against production so reviewers don't land on an empty site.
4. Post-deploy smoke test — walk me through, in order: sign up fresh account → complete profile → create + publish project → submit update → generate campaign → approve variant → verify public page → second account amplifies → logged-out partner enquiry → admin sees it. Fix anything broken before Phase C.

✅ END OF PHASE B: Production URL fully working. **HARD STOP.**

---

# PHASE C — Submission PR

Repo: `rogerSuperBuilderAlpha/hult-cohort-program` (I have fork-only access — pushes go to my fork, PR opened from the fork).

1. In my fork, create/update branch **`participants/summer26/phase-1-project-3/lorra-v`** from the latest upstream base branch.
2. Add a single submission folder — do NOT dump the app monorepo:

```
submissions/lorra-v-project-3/
├── README.md          # what Comentiq is, production URL, app repo link, screenshots
└── docs/
    ├── Architecture.md            # copied from my architecture & build plan doc
    └── Cursor_Agent_Prompt.md     # this prompt, for the agent-usage record
```

3. Open the PR:
   - **Base:** `projects/summer26/phase-1-project-3` — never `main`. Verify this branch exists upstream first; if the exact name differs, stop and show me the branch list so I choose.
   - **Title (exact pattern):** `[Project 3] Submission — lorra-v`
   - **Body** — fill every section, no placeholders:

```
## Production URL
https://<comentiq-production>.vercel.app

## Setup steps verified on fresh clone
1. …

## Architecture summary
…

## Motivation / engagement design notes
…   (the collective-momentum model: individual stories → coordinated
     amplification → partner discovery; evidence-before-hype AI)

## Known limitations
- Embeddable widget: designed (see docs/Architecture.md) but deferred
- Analytics: events logged, aggregation dashboard deferred
- Partner directory filters, voice profiles, admin campaign creation,
  weekly briefs, direct social posting: deferred
- …anything else honest

## Agent usage summary
- Research/planning: Claude (concept review, architecture, schema, phased plan)
- Dev: Cursor agent driven by this phased prompt, with Claude advising at checkpoints
- QA: manual walkthroughs at each checkpoint + production smoke test
```

4. Draft the complete README.md and PR body for my review before anything is pushed.
5. After the PR is open, I comment for review. Target merge confirmation well before Sunday 5:00 PM ET — if it's Sunday morning and not merged, my only job is chasing the merge, not touching code.

---

Begin with Phase A, Step 1. Remember: stop at every checkpoint.
