import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { proofInventory } from '@/data/cohort';

export const metadata: Metadata = {
  title: 'Vote for this showcase',
  description:
    'One-click link for cohort peers to file a written review with Vote: up during review week.',
};

const ISSUE_BASE =
  'https://github.com/rogerSuperBuilderAlpha/hult-cohort-program/issues/new';

function voteIssueUrl(reviewerHandle: string) {
  const title = encodeURIComponent(`Review by @${reviewerHandle}: @ryanroper79-alt`);
  const body = encodeURIComponent(
    `Vote: up

Production URL: ${proofInventory.productionUrl}
Build repo: ${proofInventory.buildRepo}
Submission PR: ${proofInventory.submissionPrUrl}

Sample profiles:
- ${proofInventory.productionUrl}/p/ryanroper79-alt
- ${proofInventory.productionUrl}/p/CodingWCal
- ${proofInventory.productionUrl}/p/studmuffin01 (private opt-out demo)

Partner README: ${proofInventory.productionUrl}/partners/readme

## Review by @${reviewerHandle}
**Deployment tested:** yes/no — URL: ${proofInventory.productionUrl}
**Time spent:** ~X min

### Repo exploration (cite files)
- \`data/ledger.ts\`:
- \`data/participants.ts\`:
- \`app/partners/page.tsx\`:

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
          Cohort peers: file a written technical review on the program repo with{' '}
          <code className="rounded bg-ceal-panel px-1.5 py-0.5 font-mono text-sm">Vote: up</code> if
          this site should become the cohort&apos;s public marketing surface for the rest of the
          pilot.
        </p>

        <ol className="mt-8 list-decimal space-y-3 pl-5 text-ceal-muted">
          <li>Replace YOUR-HANDLE in the link below with your GitHub username</li>
          <li>Complete the rubric (≥150 words, cite ≥3 files)</li>
          <li>Keep the Vote: up line in the issue body to cast your upvote</li>
        </ol>

        <div className="mt-10 space-y-4">
          <a
            href={voteIssueUrl('YOUR-HANDLE')}
            className="inline-block w-full rounded-md bg-ceal-mangrove px-5 py-4 text-center font-semibold text-ceal-white focus-ring hover:opacity-90 sm:w-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open GitHub review issue (edit YOUR-HANDLE) →
          </a>
          <p className="text-sm text-ceal-muted">
            Share this page with cohort members:{' '}
            <Link href="/vote" className="font-mono text-ceal-leaf underline focus-ring rounded">
              {proofInventory.productionUrl}/vote
            </Link>
          </p>
        </div>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-xl text-ceal-mangrove">What reviewers inspect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ceal-muted">
            <li>
              <Link href="/work" className="text-ceal-leaf underline focus-ring rounded">
                /work
              </Link>{' '}
              — three-week ledger + live verification chips
            </li>
            <li>
              <Link href="/builders" className="text-ceal-leaf underline focus-ring rounded">
                /builders
              </Link>{' '}
              — directory with featured builder + private opt-out
            </li>
            <li>
              <Link href="/partners" className="text-ceal-leaf underline focus-ring rounded">
                /partners
              </Link>{' '}
              — enquiry form, solutions catalog, Ryan R. Roper spotlight
            </li>
            <li>
              <Link href="/status" className="text-ceal-leaf underline focus-ring rounded">
                /status
              </Link>{' '}
              — CI badge + /api/verify summary
            </li>
            <li>
              <Link href="/rsvp" className="text-ceal-leaf underline focus-ring rounded">
                /rsvp
              </Link>{' '}
              — end-of-pilot showcase registration
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
