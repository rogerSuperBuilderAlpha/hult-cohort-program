# [Project 3] Submission — r3s0lv343vr

**NextMove** — vibe marketing platform for the Hult Cohort Developer Program Summer Pilot 2026.

## Production URL

**https://nextmove-hult.vercel.app**

- Build repo: https://github.com/r3s0lv343vr/vibe-marketing-platform (`main`)
- Partner-facing README: https://github.com/r3s0lv343vr/vibe-marketing-platform/blob/main/README.md
- Vercel project: `nextmove` (production alias `nextmove-hult.vercel.app`; prior `pixie-dust-cheesecake.vercel.app` redirects)

## Sample profile URLs

Roster still filling — placeholders included:

- https://nextmove-hult.vercel.app/profiles/r3s0lv343vr
- https://nextmove-hult.vercel.app/profiles/maya-sugarveil
- https://nextmove-hult.vercel.app/profiles/jordan-crumbtrail

Additional samples: `/profiles/aisha-glaze` · opt-out demo: `/profiles/private-opt-out`  
Partners directory: `/partners/directory`

## Vibe / positioning notes

**One-liner:** NextMove plates cohort proof for hiring partners — Brand DNA, live profiles, and intros you can taste.

**Tone:** Dark navy + atmospheric aurora green — focused, modern, evidence-first. Partners skim for GitHub-visible proof, not hype.

**Audience:** Hiring partners (Series A–public, agent-fluent eng orgs) evaluating Summer Pilot builders; secondary: public / Hult community.

**Differentiators:**
- Brand-first marketing surface (not a dashboard brochure)
- Searchable Partners directory of cohort builders (GitHub-linked tiles)
- Student GitHub-handle signup that auto-links public profile data into Profile Builder
- Immediate AI agent workspace access (edit, keep, or skip profile setup)
- AI Brand Designer studio (conversational Brand DNA, Vibe Meter, mood board, campaign feed)
- PM status snapshot deep-linked to Forth / participant PM
- Request-intro pathway aligned with partner fee model

## Partner-facing README

[`README.md`](https://github.com/r3s0lv343vr/vibe-marketing-platform/blob/main/README.md) in the build repo — project overview, features, installation, usage, architecture, stack, roadmap, contributing, and sample profile URLs.

## Product summary

Public showcase + vibe marketing studio:

| Surface | Path |
|---------|------|
| Landing | `/` |
| Cohort directory | `/cohort` |
| Partners directory | `/partners/directory` |
| Profiles | `/profiles/[slug]` |
| Partners + intro form | `/partners` |
| Student signup (GitHub / email) | `/signup`, `/signup/email` |
| Profile builder → AI tools | `/app/profile` → `/app` |
| AI Brand Designer studio | `/studio` |
| PM integration snapshot | `/status` |

## Baseline coverage

| Requirement | Implementation |
|-------------|----------------|
| Public homepage + narrative | Brand hero + product story |
| Student profiles | GitHub roster import + public default; opt-out private page |
| Portfolio links | PM / comms / showcase / live Vercel links per profile |
| PM integration | Read-only snapshot JSON + deep links to Forth / pm-r3s0lv343vr |
| Partner section | Fee summary + hire pathway + searchable directory |
| Request intro | `POST /api/request-intro` (logs + optional webhook) |
| SEO | Title, description, Open Graph, sitemap, robots |
| Deployment | Vercel HTTPS: https://nextmove-hult.vercel.app |

## Setup (fresh clone)

```bash
git clone https://github.com/r3s0lv343vr/vibe-marketing-platform.git
cd vibe-marketing-platform
npm install
cp .env.example .env.local
npm run dev
```

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Agent usage

- **Research:** Project 3 curriculum (public showcase requirements, partner pipeline), prior @r3s0lv343vr submissions, peer Project 3 PR pattern
- **Dev:** Next.js App Router platform branded NextMove — profiles, partners directory, GitHub-linked student auth, AI agent workspace, studio, PM snapshot, partner README
- **QA:** `npm run build`; production smoke on https://nextmove-hult.vercel.app (home, profiles, directory, studio, partners, request-intro API, student GitHub signup → AI tools)

## Known limitations

- Roster continues to fill as enrollment completes (`npm run import:roster`)
- Studio generation is deterministic client-side demo (no paid image/video providers yet)
- Intro email delivery requires `PLACEMENT_LEAD_EMAIL` / `INTRO_WEBHOOK_URL` in production
- PM integration is a static snapshot until unification exposes a shared read API
- Student auth is MVP cookie-session (GitHub handle or email + password); not full GitHub OAuth
