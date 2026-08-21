'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SITE } from '@/lib/site';

type TabId = 'digitize' | 'decide' | 'decarbonize' | 'calculator';

type TabContent = {
  id: TabId;
  label: string;
  headline: string;
  summary: string;
  bullets: string[];
  cta: { href: string; label: string; external?: boolean };
  secondaryCta?: { href: string; label: string; external?: boolean };
};

const TABS: TabContent[] = [
  {
    id: 'digitize',
    label: 'Digitize',
    headline: 'Turn bills and buildings into actionable data',
    summary:
      'Upload electricity bills and capture images of rooms and equipment to understand where and how energy is being consumed across your property.',
    bullets: [
      'Paste or photograph T&TEC, JPS, BL&P, and SKELEC bills — kWh and spend extracted locally',
      'Record floor area in m² or ft², major loads, and operating hours for a credible baseline',
      'Map rooms and equipment so end-use patterns reflect real Caribbean operating conditions',
      'Secure session storage for live cohorts and audit-ready data capture',
    ],
    cta: { href: '/calculator', label: 'Upload your bill →' },
    secondaryCta: { href: SITE.bookNowUrl, label: 'Book a site visit', external: true },
  },
  {
    id: 'decide',
    label: 'Decide',
    headline: 'Know what to fix first — and what it is worth',
    summary:
      'Receive practical recommendations showing where money can be saved, which equipment or controls should be upgraded, expected savings and payback periods, and available grants or financing.',
    bullets: [
      'Priority value cards for AC, refrigeration, and remote sensors with local currency savings',
      'Illustrative payback bands and a phased roadmap targeting ≥25% bill reduction',
      'Jurisdiction tariff comparison across Trinidad, Barbados, Jamaica, and St Kitts',
      'Audit readiness score and ASHRAE-aligned next steps before renewable capex',
    ],
    cta: { href: '/calculator', label: 'See your savings plan →' },
    secondaryCta: { href: '/venture/business-plan', label: 'Business plan overview' },
  },
  {
    id: 'decarbonize',
    label: 'Decarbonize',
    headline: 'Implement with CEAL Green and prove the results',
    summary:
      'Implement improvements with CEAL Green and track electricity bills over time to verify actual cost and energy savings while reducing the property\'s carbon footprint.',
    bullets: [
      'Engineer-led install plan prioritized to your budget over months, not guesswork',
      'Commissioning and bill tracking to confirm real kWh and cost reductions',
      'Efficiency-first sequencing — leaner load before solar and storage sizing',
      'Ongoing monitoring mindset aligned with Caribbean climate and tariff realities',
    ],
    cta: { href: SITE.bookNowUrl, label: 'Book Now — CEAL engineers', external: true },
    secondaryCta: { href: '/monitor', label: 'Usage monitor demo' },
  },
  {
    id: 'calculator',
    label: 'Calculator',
    headline: 'Caribbean Energy Calculator — start here',
    summary:
      'The calculator is the entry point to Greenularity Caribbean™: enter your bill, review savings scenarios in local currency, and save results for your organization or live session.',
    bullets: [
      'Monthly spend in TTD, BBD, JMD, or EC$ with automatic USD reference',
      'T&TEC-style bill paste helper with 62-day period normalization',
      'End-use breakdown, ECM paybacks, and 25% reduction target banner',
      'Optional contact capture → Google Sheet for cohorts and investor evidence',
    ],
    cta: { href: '/calculator', label: 'Open calculator →' },
    secondaryCta: {
      href: '/event/join?code=CEAL50-AUG15',
      label: 'Join live session link',
    },
  },
];

function TabIcon({ id }: { id: TabId }) {
  const cls = 'h-6 w-6';
  switch (id) {
    case 'digitize':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'decide':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'decarbonize':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'calculator':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
}

function CtaLink({
  href,
  label,
  external,
  primary,
}: {
  href: string;
  label: string;
  external?: boolean;
  primary?: boolean;
}) {
  const className = primary
    ? 'inline-flex items-center justify-center rounded-lg bg-ceal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ceal-700'
    : 'inline-flex items-center justify-center rounded-lg border border-ceal-600/30 bg-white px-5 py-2.5 text-sm font-semibold text-ceal-800 transition hover:bg-ceal-50';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function HomeTabs({ defaultTab = 'calculator' }: { defaultTab?: TabId }) {
  const [active, setActive] = useState<TabId>(defaultTab);
  const panel = TABS.find((t) => t.id === active) ?? TABS[3];

  return (
    <div className="overflow-hidden rounded-2xl border border-ceal-900/10 bg-white shadow-xl shadow-ceal-900/5">
      <div
        role="tablist"
        aria-label="Greenularity platform"
        className="grid grid-cols-2 gap-1 border-b border-ceal-900/10 bg-gradient-to-r from-ceal-900 via-ceal-800 to-ceal-900 p-2 sm:grid-cols-4"
      >
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                selected
                  ? 'bg-white text-ceal-900 shadow-md'
                  : 'text-ceal-50/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <TabIcon id={tab.id} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${panel.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${panel.id}`}
        className="grid gap-8 p-6 lg:grid-cols-2 lg:p-10"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ceal-600">{panel.label}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-ceal-950 sm:text-3xl">
            {panel.headline}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-ceal-800/90">{panel.summary}</p>
          <ul className="mt-6 space-y-3">
            {panel.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm leading-relaxed text-ceal-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ceal-500" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={panel.cta.href} label={panel.cta.label} external={panel.cta.external} primary />
            {panel.secondaryCta ? (
              <CtaLink
                href={panel.secondaryCta.href}
                label={panel.secondaryCta.label}
                external={panel.secondaryCta.external}
              />
            ) : null}
          </div>
        </div>

        <div className="relative">
          {panel.id === 'calculator' ? (
            <CalculatorShowcase />
          ) : (
            <PillarVisual id={panel.id} label={panel.label} />
          )}
        </div>
      </div>
    </div>
  );
}

function PillarVisual({ id, label }: { id: TabId; label: string }) {
  const accents: Record<string, string> = {
    digitize: 'from-emerald-600/20 to-teal-700/30',
    decide: 'from-ceal-600/20 to-emerald-800/30',
    decarbonize: 'from-teal-700/20 to-ceal-900/30',
  };
  return (
    <div
      className={`flex h-full min-h-[280px] flex-col justify-between rounded-2xl bg-gradient-to-br ${accents[id] ?? accents.digitize} border border-ceal-500/20 p-6`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ceal-700">{label}</p>
        <p className="mt-4 text-lg font-semibold text-ceal-950">
          Caribbean households &amp; businesses
        </p>
        <p className="mt-2 text-sm text-ceal-800/85">
          Built for regional tariffs, commercial cooling loads, and engineer-led delivery through CEAL
          Green.
        </p>
      </div>
      <div className="mt-6 rounded-xl bg-white/80 p-4 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-wide text-ceal-600">Powered by</p>
        <p className="mt-1 font-bold text-ceal-900">Greenularity Caribbean™</p>
        <p className="text-sm text-ceal-700">{SITE.tagline}</p>
      </div>
    </div>
  );
}

function CalculatorShowcase() {
  return (
    <div className="rounded-2xl border border-ceal-500/25 bg-ceal-50/80 p-5 shadow-inner">
      <p className="text-xs font-bold uppercase tracking-wider text-ceal-600">Live preview</p>
      <div className="mt-4 space-y-3 rounded-xl border border-ceal-200 bg-white p-4 text-sm shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-ceal-50 p-3">
            <p className="text-[10px] uppercase text-ceal-600">Country</p>
            <p className="font-semibold text-ceal-900">Trinidad &amp; Tobago</p>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3">
            <p className="text-[10px] uppercase text-ceal-600">Monthly bill</p>
            <p className="font-semibold text-ceal-900">TT$420</p>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3">
            <p className="text-[10px] uppercase text-ceal-600">kWh</p>
            <p className="font-semibold text-ceal-900">787</p>
          </div>
          <div className="rounded-lg bg-ceal-50 p-3">
            <p className="text-[10px] uppercase text-ceal-600">25% target</p>
            <p className="font-semibold text-ceal-900">−TT$105/mo</p>
          </div>
        </div>
        <div className="rounded-lg border border-ceal-200 p-3">
          <p className="text-xs font-semibold text-ceal-800">Priority upgrades</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['AC efficiency', 'Refrigeration', 'Remote sensors'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ceal-100 px-2.5 py-0.5 text-xs font-medium text-ceal-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/calculator"
          className="block w-full rounded-lg bg-ceal-600 py-2.5 text-center text-sm font-bold text-white hover:bg-ceal-700"
        >
          Calculate my savings →
        </Link>
      </div>
      <p className="mt-3 text-center text-xs text-ceal-700">
        Illustrative T&amp;TEC Commercial B baseline — your bill drives the results.
      </p>
    </div>
  );
}

export { TABS };
export type { TabId };
