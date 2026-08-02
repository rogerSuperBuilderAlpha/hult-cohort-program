'use client';

import { useEffect, useState } from 'react';

type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export function ShipTicker() {
  const [commits, setCommits] = useState<Commit[]>([]);

  useEffect(() => {
    fetch('/api/commits')
      .then((r) => r.json())
      .then((data: { commits: Commit[] }) => setCommits(data.commits ?? []))
      .catch(() => setCommits([]));
  }, []);

  if (commits.length === 0) return null;

  return (
    <section
      aria-label="Recent cohort commits"
      className="mt-16 overflow-hidden rounded-lg border border-ceal-line bg-ceal-panel"
    >
      <div className="border-b border-ceal-line px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-widest text-ceal-leaf">Live ship ticker</p>
      </div>
      <ul className="divide-y divide-ceal-line">
        {commits.slice(0, 10).map((c) => (
          <li key={c.sha} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={c.url}
              className="text-sm font-medium text-ceal-mangrove hover:text-ceal-leaf focus-ring rounded dark:text-ceal-panel"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.message.slice(0, 80)}
              {c.message.length > 80 ? '…' : ''}
            </a>
            <span className="font-mono text-xs text-ceal-muted">
              {c.author} · {c.sha.slice(0, 7)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
