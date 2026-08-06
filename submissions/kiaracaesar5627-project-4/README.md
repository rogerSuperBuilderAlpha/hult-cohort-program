# Interview Room (Week 4 · Ludwitt learning)

Mock-interview practice across **25 job tracks** (500 interview questions): core
product roles plus major business tracks (FP&A, consulting, IB, BA, project
management, accounting/audit, supply chain, corporate strategy, BD,
risk/compliance, corporate communications, HRBP, founder, sales manager, GM).
Each scenario is phrased as an interviewer question with a playbook and debrief.
Registered on a Ludwitt/Hult-compatible API at the same origin.

## Topic

**Interview prep by role** — ≥20 interview questions per job-application track.

## Stack

- Next.js 15 App Router · TypeScript · Tailwind 4
- `jose` for HS256 launch JWTs
- Platform routes mirror `execution/ludwitt-hult-api` OpenAPI

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

```bash
npm run smoke
```

## Product surfaces

| Route | Role |
|-------|------|
| `/` | Interview Room landing |
| `/practice` | Job-track picker |
| `/practice/[track]` | Scenarios for that role |
| `/practice/[track]/[slug]` | Scenario + interviewer + playbook + debrief |
| `/launch?token=` | Ludwitt JWT gate → practice room |

## Integration

Seeded app ID: `7f3e9c2a-4b1d-4e8f-9a6c-2d5e8f1a3b7c`

## Deploy

```bash
npx vercel --prod --scope personal-portfolio-kc
```
