import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { proofInventory } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Vote for this showcase',
  description: 'Peer review helper for the Hult Climate Builder Network submission.',
};

const ISSUE_BASE =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/issues/new';

function voteIssueUrl(reviewerHandle: string) {
  const title = encodeURIComponent(`Review by @${reviewerHandle}: @ryanroper79-alt`);
  const body = encodeURIComponent(
    `Vote: up

Production URL: ${proofInventory.productionUrl}
Build repo: ${proofInventory.buildRepo}

Sample profiles:
- ${proofInventory.productionUrl}/p/ryanroper79-alt
- ${proofInventory.productionUrl}/p/CodingWCal
- ${proofInventory.productionUrl}/p/studmuffin01 (private opt-out)

Partner README: ${proofInventory.productionUrl}/partners/readme

## Review by @${reviewerHandle}
**Deployment tested:** yes/no — URL: ${proofInventory.productionUrl}
**Time spent:** ~X min

### Repo exploration (cite files)
- \`data/ledger.ts\`:
- \`data/roster.ts\`:
- \`components/WorkLedger.tsx\`:
- \`lib/artifact-check.ts\`:

### Rubric
| Dimension | Score (1-5) | Note |
| Production readiness | | |
| Core functionality | | |
| Code quality | | |
| Ecosystem thinking | | |
| Credibility to employers | | |

### One actionable suggestion


### Recommendation
merge-ready / needs-work / incoherent
`,
  );
  return `${ISSUE_BASE}?title=${title}&body=${body}`;
}

export default function VotePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Review week</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">
          Vote for this showcase
        </h1>
        <p className="mt-4 text-lg text-ceal-muted">
          File a written technical review on the program repo with{' '}
          <code className="rounded bg-ceal-panel px-1.5 py-0.5 font-mono text-sm">Vote: up</code>.
        </p>

        <div className="mt-10">
          <a
            href={voteIssueUrl('YOUR-HANDLE')}
            className="inline-block w-full rounded-md bg-ceal-mangrove px-5 py-4 text-center font-semibold text-ceal-white focus-ring hover:opacity-90 sm:w-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open GitHub review issue (edit YOUR-HANDLE) →
          </a>
        </div>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-xl text-ceal-mangrove">Inspect before you vote</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ceal-muted">
            <li>
              <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
                /work
              </Link>{' '}
              — artifact ledger + quality scorecards (deploy URLs only)
            </li>
            <li>
              <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
                /partners/readme
              </Link>
            </li>
            <li>
              <Link href="/status" className="text-ceal-leaf underline focus-ring rounded">
                /status
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
