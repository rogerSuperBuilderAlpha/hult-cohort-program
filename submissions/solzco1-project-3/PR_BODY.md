## Summary

**Pulse** — live telemetry vibe marketing platform for the Hult Developer Cohort Summer Pilot 2026. Dark-mode-first cyberpunk UI with live cohort activity ticker, 20 builder profiles, showcase cards with architecture inspector, partner portal + Quick Connect micro-modals, Forth PM snapshot integration, and vibe customizer easter egg.

Code: `submissions/solzco1-project-3/`

## Production URL

https://pulse-ten-theta.vercel.app

(`pulse.vercel.app` is already claimed on Vercel — this deploy uses project alias `pulse-ten-theta.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` in Vercel env to match.)

## Sample profile URLs

- https://pulse-ten-theta.vercel.app/builders/solzco1
- https://pulse-ten-theta.vercel.app/builders/mitchelldante99-create
- https://pulse-ten-theta.vercel.app/builders/nikjain15
- https://pulse-ten-theta.vercel.app/builders/arjun-singh2127
- https://pulse-ten-theta.vercel.app/builders/codingwcal
- https://pulse-ten-theta.vercel.app/builders/divyaprakash04
- https://pulse-ten-theta.vercel.app/builders/gge513
- https://pulse-ten-theta.vercel.app/builders/godwinkamau
- https://pulse-ten-theta.vercel.app/builders/jiaxinaspenlin-dotcom
- https://pulse-ten-theta.vercel.app/builders/jj-javascript
- https://pulse-ten-theta.vercel.app/builders/joes9987
- https://pulse-ten-theta.vercel.app/builders/kiaracaesar5627
- https://pulse-ten-theta.vercel.app/builders/kperpignant
- https://pulse-ten-theta.vercel.app/builders/lorra-v
- https://pulse-ten-theta.vercel.app/builders/lvcasmadeit
- https://pulse-ten-theta.vercel.app/builders/r3s0lv343vr
- https://pulse-ten-theta.vercel.app/builders/ramyatolety
- https://pulse-ten-theta.vercel.app/builders/raven-dubgub
- https://pulse-ten-theta.vercel.app/builders/studmuffin01
- https://pulse-ten-theta.vercel.app/builders/zukhriddingit

## Vibe / positioning notes

**Pulse** turns a standard cohort directory into a high-converting partner magnet. The hero hook: *“We are the Hult Developer Cohort. Not junior engineers, but hyper-focused builders shipping production-ready systems at the intersection of AI, product, and code.”*

Visual direction: dark-mode-first with electric indigo + emerald accents, glassmorphism, cursor-reactive glow, and a nav **Vibe** easter egg (Cyberpunk · Brutalist · Y2K · Executive). Projects are framed for partners through problem solved, speed-to-market, and complexity — not stack lists alone.

Game-changing features shipped: **Live Pulse** terminal (GitHub activity ticker), **Quick Connect** drawers on every builder card, **Under the Hood** architecture inspector on showcase cards, and integrated read-only **Forth PM** cohort status.

## Partner-facing README

`submissions/solzco1-project-3/PARTNERS.md` — hire / sponsor / collaborate / sandbox review CTAs, 10-minute evaluation guide, commercial terms summary, sample profile URLs, and intro form flow to placement lead (`solangecoker@hotmail.com`).

## Agent usage

- **Research:** Hult Project 3 requirements, peer submissions (`studmuffin01-project-3`, curriculum showcase spec), Forth + Cohort Comms winning deploy URLs, founder positioning interview.
- **Dev:** Cursor agent scaffolded full Next.js 14 app — roster, live ticker, PM snapshot, showcase + architecture toggle, partner portal, Quick Connect modals, Supabase partner inquiries, vibe theming.
- **QA:** `npm test` (4/4 pass), `npm run build` pass locally + Vercel production deploy.

## Test plan

- [x] Fresh clone: `npm install`, copy `.env.example`, run `supabase/schema.sql`
- [x] `npm test` — roster, profile URLs, showcase links
- [x] `npm run build` — production compile
- [x] Production deploy live at https://pulse-ten-theta.vercel.app
- [ ] Homepage: Live Pulse ticker + cohort metrics + Forth PM panel
- [ ] `/builders` — 20 profile cards with Quick Connect
- [ ] `/showcase` — architecture inspector toggle on project cards
- [ ] `/partners` — request intro form submits (requires Vercel env: Supabase keys + `PLACEMENT_LEAD_EMAIL`)
- [ ] Vibe customizer cycles themes in nav

## Deploy notes (operator)

Vercel project: `pulse` · Root Directory: `submissions/solzco1-project-3`

Add production env vars from `.env.example` (Supabase URL/keys, `PLACEMENT_LEAD_EMAIL`, `NEXT_PUBLIC_SITE_URL`). Optional `GITHUB_TOKEN` enables live GitHub events in the ticker.
