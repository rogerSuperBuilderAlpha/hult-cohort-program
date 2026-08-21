import Link from 'next/link';
import { VentureDocList } from '@/components/VentureDocs';
import { Disclaimer } from '@/components/Disclaimer';

export default function VentureIndexPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ceal-900">Greenularity Caribbean™ — venture materials</h2>
        <p className="mt-3 text-sm text-ceal-800/90">
          Sanitized business, marketing, and research documents for the Hult Phase 2 venture submission.
          Public demo at{' '}
          <a className="underline" href="https://caribbeanenergyauditor.vercel.app">
            caribbeanenergyauditor.vercel.app
          </a>
          . No proprietary Greenularity methodology, named CRM prospects, or confidential CEAL data appear
          here.
        </p>
        <p className="mt-4 text-sm text-ceal-700">
          <Link href="/" className="underline">
            ← Back to application home
          </Link>
          {' · '}
          Calculator requires{' '}
          <Link href="/calculator" className="underline">
            authenticated launch
          </Link>
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-ceal-900">Documents</h3>
        <VentureDocList />
      </section>

      <section className="rounded-xl border bg-white p-5 text-sm">
        <h3 className="font-semibold text-ceal-900">Repository paths (for reviewers)</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs text-ceal-700">
          <li>participants/summer26/phase-2-venture/ryanroper79-alt/docs/</li>
          <li>participants/summer26/phase-2-venture/ryanroper79-alt/INVESTOR_LOG.md</li>
          <li>participants/summer26/phase-2-venture/ryanroper79-alt/evidence/</li>
        </ul>
      </section>

      <Disclaimer />
    </div>
  );
}
