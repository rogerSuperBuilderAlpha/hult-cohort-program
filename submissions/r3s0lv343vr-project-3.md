# [Project 3] Submission — r3s0lv343vr

**Pixie Dust Cheesecake** — vibe marketing platform for the Hult Cohort Developer Program Summer Pilot 2026.

## Production URL

**https://pixie-dust-cheesecake.vercel.app**

- Build repo: https://github.com/r3s0lv343vr/vibe-marketing-platform (`main`)
- Partner-facing README: https://github.com/r3s0lv343vr/vibe-marketing-platform/blob/main/README.md
- Vercel project: `pixie-dust-cheesecake` (production alias live; smoke-tested 2026-07-30)

## Sample profile URLs

Roster still filling — placeholders included:

- https://pixie-dust-cheesecake.vercel.app/profiles/r3s0lv343vr
- https://pixie-dust-cheesecake.vercel.app/profiles/maya-sugarveil
- https://pixie-dust-cheesecake.vercel.app/profiles/jordan-crumbtrail

Additional samples: `/profiles/aisha-glaze` · opt-out demo: `/profiles/private-opt-out`

## Vibe / positioning notes

**One-liner:** Pixie Dust Cheesecake plates cohort proof for hiring partners — Brand DNA, live profiles, and intros you can taste.

**Tone:** Warm, sensorial, lightly magical — rose sugar, champagne gold, mint frosting — without soft standards. Partners skim for GitHub-visible evidence, not hype.

**Audience:** Hiring partners (Series A–public, agent-fluent eng orgs) evaluating Summer Pilot builders; secondary: public / Hult community.

**Differentiators:**
- Brand-first marketing surface (not a dashboard brochure)
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
| Profiles | `/profiles/[slug]` |
| Partners + intro form | `/partners` |
| AI Brand Designer studio | `/studio` |
| PM integration snapshot | `/status` |

## Baseline coverage

| Requirement | Implementation |
|-------------|----------------|
| Public homepage + narrative | Brand hero + ≥200-word story |
| Student profiles | Placeholder roster; public default; opt-out private page |
| Portfolio links | PM / comms / showcase links per profile |
| PM integration | Read-only snapshot JSON + deep links to Forth / pm-r3s0lv343vr |
| Partner section | Fee summary + hire pathway |
| Request intro | `POST /api/request-intro` (logs + optional webhook) |
| SEO | Title, description, Open Graph, sitemap, robots |
| Deployment | Vercel HTTPS: https://pixie-dust-cheesecake.vercel.app |

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
- **Dev:** Next.js App Router platform branded Pixie Dust Cheesecake — profiles, partners, studio, PM snapshot, partner README
- **QA:** `npm run build`; production smoke on https://pixie-dust-cheesecake.vercel.app (home, profiles, studio, partners, request-intro API)

## Known limitations

- Roster placeholders until enrollment completes
- Studio generation is deterministic client-side demo (no paid image/video providers yet)
- Intro email delivery requires `PLACEMENT_LEAD_EMAIL` / `INTRO_WEBHOOK_URL` in production
- PM integration is a static snapshot until unification exposes a shared read API
