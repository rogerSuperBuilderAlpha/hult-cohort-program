import { positioning } from '@/data/cohort';

export async function GET() {
  const body = `# ${positioning.siteTitle}

> Digital participants solving climate problems for the Caribbean and global Small Island Developing States.

## Production URL
${positioning.productionDomain}

## What this site is
- Public climate software index for Summer Pilot 2026 (Weeks 1–3)
- Cross-cohort ledger at /work with artifact quality scorecards (deploy URLs only)
- Participant profiles at /p/{handle}
- Cohort introduction requests at /partners (not a marketplace)
- Program repo: ${positioning.programRepo}

## Key routes
- /work — build ledger + artifact checks
- /join — roster self-serve PR
- /partners/readme — partner README
- /vote — peer review vote helper
- /status — CI and verification

## Operator
@${positioning.maintainer.githubHandle}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
