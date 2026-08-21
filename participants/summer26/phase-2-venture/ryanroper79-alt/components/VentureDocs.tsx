import { readFileSync } from 'fs';
import path from 'path';
import Link from 'next/link';

const DOCS: Record<string, { title: string; file: string; description: string }> = {
  'business-plan': {
    title: 'Business plan',
    file: 'business-plan.md',
    description: 'Executive summary, model, roadmap, and risks (sanitized public).',
  },
  'marketing-investment-plan': {
    title: 'Marketing & investment plan',
    file: 'marketing-investment-plan.md',
    description: 'GTM phases, unit-economics targets, investor categories — no named prospects.',
  },
  'elevator-pitch': {
    title: 'Elevator pitch',
    file: 'elevator-pitch.md',
    description: 'One-minute narrative for investors and partners.',
  },
  'market-research': {
    title: 'Market research',
    file: 'market-research.md',
    description: 'Public-source sizing, tariff context, and MVP validation metrics.',
  },
  'pitch-deck': {
    title: 'Investor deck (outline)',
    file: 'pitch-deck.md',
    description: 'Slide-by-slide sanitized deck for cohort submission.',
  },
};

function loadDoc(slug: string): string {
  const meta = DOCS[slug];
  if (!meta) throw new Error('Unknown document');
  return readFileSync(path.join(process.cwd(), 'docs', meta.file), 'utf8');
}

export function VentureDocList() {
  return (
    <ul className="space-y-3">
      {Object.entries(DOCS).map(([slug, doc]) => (
        <li key={slug} className="rounded-xl border bg-white p-4">
          <Link href={`/venture/${slug}`} className="font-semibold text-ceal-800 underline">
            {doc.title}
          </Link>
          <p className="mt-1 text-sm text-ceal-800/80">{doc.description}</p>
          <p className="mt-2 font-mono text-xs text-ceal-600">docs/{doc.file}</p>
        </li>
      ))}
    </ul>
  );
}

export function VentureDocView({ slug }: { slug: string }) {
  const meta = DOCS[slug];
  if (!meta) return null;
  const content = loadDoc(slug);
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ceal-600">Venture materials · sanitized public</p>
      <h2 className="mt-2 text-2xl font-bold text-ceal-900">{meta.title}</h2>
      <pre className="mt-6 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-ceal-50/50 p-4 text-sm leading-relaxed text-ceal-900">
        {content}
      </pre>
    </article>
  );
}

export function ventureDocSlugs(): string[] {
  return Object.keys(DOCS);
}
