import { positioning } from '@/data/cohort';

export async function GET() {
  const body = `# Hult Cohort · Summer Pilot 2026 — Showcase Platform

> Cohort-first, evidence-first marketing surface for the Hult Cohort Developer Program.

## Production URL
${positioning.productionDomain}

## What this site is
- Public showcase for cohort builders and shipped work (Weeks 1–3)
- Cross-cohort ledger at /work with live verification at /api/verify
- Builder profiles at /p/{handle}
- Partner engagement at /partners (not capital solicitation)
- Commercial Caribbean infrastructure work: ${positioning.cealGreenUrl}

## Key routes
- /work — three-week build ledger
- /join — roster contribution
- /contribute — governance and open tickets
- /partners/readme — partner-facing README
- /vote — peer review vote link for Week 3 competition
- /status — CI and quality surface

## Maintainer
${positioning.maintainer.name} (@${positioning.maintainer.githubHandle})
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
