'use client';

import { useState } from 'react';
import { joinProfileSnippet, participantsEditUrl } from '@/data/constants';

export function JoinSelfServe() {
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    await navigator.clipboard.writeText(joinProfileSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="mt-12 rounded-lg border border-ceal-line bg-ceal-panel p-6">
      <h2 className="font-display text-2xl text-ceal-mangrove">Two-minute self-serve PR</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ceal-muted">
        <li>Copy the snippet below into `data/participants.ts` inside the `roster` array.</li>
        <li>
          <a
            href={participantsEditUrl}
            className="font-medium text-ceal-leaf underline focus-ring rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit participants.ts on GitHub →
          </a>
        </li>
        <li>Open a PR — CI must pass. Your profile publishes on merge + redeploy.</li>
      </ol>

      <pre className="mt-6 overflow-x-auto rounded-md border border-ceal-line bg-ceal-white p-4 font-mono text-xs text-ceal-ink dark:bg-ceal-ink/30 dark:text-ceal-panel">
        {joinProfileSnippet}
      </pre>

      <button
        type="button"
        onClick={copySnippet}
        className="mt-4 rounded-md border border-ceal-mangrove px-4 py-2 text-sm font-semibold text-ceal-mangrove focus-ring hover:bg-ceal-white"
      >
        {copied ? 'Copied!' : 'Copy snippet'}
      </button>
    </section>
  );
}
