import Link from 'next/link';
import { SiteHeader, SiteFooter, StickyJoinBar } from '@/components/SiteChrome';
import { MarkdownDocument, readFileMarkdown } from '@/lib/markdown';
import { fetchGoodFirstIssues, goodFirstIssuesFallbackUrl } from '@/lib/github-issues';
import path from 'node:path';

export const revalidate = 3600;

export const metadata = {
  title: 'Contribute',
  description: 'Claim-first governance, protected areas, and open tickets for the cohort showcase.',
};

export default async function ContributePage() {
  const contributing = readFileMarkdown(path.join(process.cwd(), 'CONTRIBUTING.md'));
  const issues = await fetchGoodFirstIssues();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ceal-leaf">Governance</p>
        <h1 className="mt-3 font-display text-4xl text-ceal-mangrove md:text-5xl">Contribute</h1>
        <p className="mt-4 text-lg text-ceal-muted">
          This platform is built to be operated by the cohort. Claim a ticket, pass CI, ship evidence.
        </p>

        <section className="mt-12">
          <MarkdownDocument md={contributing} />
        </section>

        <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
          <h2 className="font-display text-2xl text-ceal-mangrove">Open tickets</h2>
          <p className="mt-2 text-sm text-ceal-muted">
            Two clicks from claim to code: pick an issue, comment to claim, open a PR.
          </p>
          {issues.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {issues.map((issue) => (
                <li key={issue.number}>
                  <a
                    href={issue.html_url}
                    className="font-medium text-ceal-leaf underline focus-ring rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    #{issue.number} — {issue.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ceal-muted">
              No labeled issues returned from GitHub API — browse the backlog directly.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a
              href={goodFirstIssuesFallbackUrl}
              className="text-ceal-leaf underline focus-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              good-first-issue on GitHub →
            </a>
            <Link href="/join" className="text-ceal-leaf underline focus-ring rounded">
              Publish your profile →
            </Link>
          </div>
        </section>

        <section className="mt-12 space-y-2 text-sm text-ceal-muted">
          <p>
            Agent instructions:{' '}
            <code className="rounded bg-ceal-panel px-1 py-0.5 font-mono text-xs">AGENTS.md</code>
          </p>
          <p>
            Ticket mirror:{' '}
            <code className="rounded bg-ceal-panel px-1 py-0.5 font-mono text-xs">
              docs/ticket-backlog.md
            </code>
          </p>
        </section>
      </main>
      <SiteFooter />
      <StickyJoinBar />
    </>
  );
}
