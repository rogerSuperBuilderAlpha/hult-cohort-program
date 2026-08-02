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

Sample profiles:
- ${proofInventory.productionUrl}/p/ryanroper79-alt
- ${proofInventory.productionUrl}/p/CodingWCal
- ${proofInventory.productionUrl}/p/ramyatolety

Partner README: ${proofInventory.productionUrl}/partners/readme

## Technical review

- 
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
          <li>Complete the technical review section (deploy, ledger, profiles, accessibility)</li>
          <li>Keep the Vote: up line in the issue body</li>
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
              — three-week ledger for all builders
            </li>
            <li>
              <Link href="/p/ryanroper79-alt" className="text-ceal-leaf underline focus-ring rounded">
                /p/your-handle
              </Link>{' '}
              — every enrolled profile published
            </li>
            <li>
              <Link href="/partners/readme" className="text-ceal-leaf underline focus-ring rounded">
                /partners/readme
              </Link>{' '}
              — partner-facing README rendered on-site
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
