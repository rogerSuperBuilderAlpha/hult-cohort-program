# Pulse — Hult Cohort Vibe Marketing Platform

**Production:** https://pulse-ten-theta.vercel.app  
**Code:** `submissions/solzco1-project-3/`

Live telemetry and heartbeat of the Hult Developer Cohort Summer Pilot 2026 — a partner-magnetizing showcase, not a sterile directory.

## Fresh clone

```bash
cd submissions/solzco1-project-3
npm install
cp .env.example .env.local   # fill Supabase + optional GITHUB_TOKEN
```

In Supabase SQL editor, run `supabase/schema.sql`.

```bash
npm run dev    # http://localhost:3000
npm test
npm run build
```

## Vercel deploy

Set **Root Directory** to `submissions/solzco1-project-3`.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Partner inquiry inserts (server only) |
| `PLACEMENT_LEAD_EMAIL` | Intro form destination |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. https://pulse-ten-theta.vercel.app) |
| `GITHUB_TOKEN` | Optional — live GitHub activity in Pulse ticker |

## Features

- **Live Pulse ticker** — GitHub public events + cohort metrics
- **PM integration** — read-only Forth cohort status snapshot
- **Builder profiles** — 20 enrolled participants (public opt-in)
- **Showcase** — project evidence with architecture inspector toggle
- **Partner portal** — hire / sponsor / collaborate CTAs + intro form
- **Quick Connect** — per-builder micro-modal (resume, Calendly, sandbox review)
- **Vibe customizer** — Cyberpunk · Brutalist · Y2K · Executive (nav easter egg)

## Integrations

| Platform | URL |
|----------|-----|
| Winning PM (Forth) | https://forth-bice.vercel.app/ |
| Winning Comms | https://cohort-comms-phi.vercel.app/ |
| Sol PM | https://solzpm.vercel.app/ |
| Sol Comms | https://solforth.vercel.app/ |

Partner guide: [PARTNERS.md](./PARTNERS.md)
