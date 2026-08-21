'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { GreenularityLogo } from '@/components/GreenularityLogo';
import { HomeSignInSheet, type SessionProfile } from '@/components/HomeSignInSheet';
import { SITE, EVENT_JOIN_PATH } from '@/lib/site';

type Props = {
  sessionProfile?: SessionProfile | null;
  /** When set, protected app routes redirect here instead of their direct path */
  authGateHref?: string | null;
  eventLive?: boolean;
  error?: string | null;
  launched?: boolean;
};

function resolveAppHref(path: string, authGateHref?: string | null): string {
  if (path === '/') return '/';
  if (authGateHref) return authGateHref;
  return path;
}

/** Illustrative T&TEC Commercial B — 25% spend reduction Jan → Jun */
const MONTHLY_SPEND_TTD = [
  { month: 'Jan', amount: 560 },
  { month: 'Feb', amount: 545 },
  { month: 'Mar', amount: 520 },
  { month: 'Apr', amount: 495 },
  { month: 'May', amount: 455 },
  { month: 'Jun', amount: 420 },
] as const;

const JAN_SPEND = MONTHLY_SPEND_TTD[0].amount;
const JUN_SPEND = MONTHLY_SPEND_TTD[5].amount;
const SPEND_DROP_PCT = Math.round((1 - JUN_SPEND / JAN_SPEND) * 100);

const NAV = [
  { label: 'Home', href: '/', active: true, icon: '🏠' },
  { label: 'Energy Calculator', href: '/calculator', icon: '📊' },
  { label: 'My Energy Audit', href: '/audit', icon: '🔍' },
  { label: 'My Bills', href: '/bills', icon: '📄' },
  { label: 'Recommendations', href: '/recommendations', icon: '💡' },
  { label: 'Incentives & Grants', href: '/venture/marketing-investment-plan', icon: '🎁' },
  { label: 'CEAL Green Services', href: SITE.bookNowUrl, external: true, icon: '🔧' },
  { label: 'Savings Tracker', href: '/monitor', icon: '📈' },
  { label: 'Reports', href: '/venture', icon: '📋' },
  { label: 'Settings', href: '/privacy', icon: '⚙️' },
];

const QUICK_ACTIONS = [
  {
    title: 'Upload Bill',
    desc: 'Scan or upload your electricity bill',
    href: '/bills',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    icon: '📤',
  },
  {
    title: 'Home / Business Audit',
    desc: 'Take photos and answer a few questions',
    href: '/audit',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: '📷',
  },
  {
    title: 'Get Smart Recommendations',
    desc: 'AI-powered insights tailored for you',
    href: '/recommendations',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: '💡',
  },
  {
    title: 'Find Grants & Incentives',
    desc: 'See what funding you may qualify for',
    href: '/venture/marketing-investment-plan',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    icon: '🎁',
  },
  {
    title: 'CEAL Green Services',
    desc: 'Get expert support for installation',
    href: SITE.bookNowUrl,
    external: true,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '🔧',
  },
];

const END_USE = [
  { label: 'Air Conditioning', pct: 42, color: '#16a34a' },
  { label: 'Water Heating', pct: 18, color: '#0ea5e9' },
  { label: 'Refrigeration', pct: 15, color: '#8b5cf6' },
  { label: 'Lighting', pct: 10, color: '#f59e0b' },
  { label: 'Others', pct: 15, color: '#94a3b8' },
];

const STEPS = [
  { n: 1, title: 'Upload Your Bill', desc: 'We extract key data securely', icon: '📄' },
  { n: 2, title: 'Audit Your Space', desc: 'Photos + info help us understand your usage', icon: '📷' },
  { n: 3, title: 'Get AI Insights', desc: 'Receive tailored solutions to reduce waste and cost', icon: '🤖' },
  { n: 4, title: 'Save & Track', desc: 'Implement, save money and track results', icon: '📈' },
];

const ACTIVITY = [
  { text: 'Electricity bill uploaded', time: '2h ago', icon: '📄' },
  { text: 'Audit completed', time: '5h ago', icon: '✅' },
  { text: 'New recommendation ready', time: '1d ago', icon: '💡' },
  { text: 'Incentive matched', time: '2d ago', icon: '🎁' },
];

function DonutChart() {
  let offset = 0;
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-32 w-32" aria-hidden>
      {END_USE.map((slice) => {
        const dash = (slice.pct / 100) * c;
        const el = (
          <circle
            key={slice.label}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function SpendTrendChart() {
  const min = 400;
  const max = 580;
  const points = MONTHLY_SPEND_TTD.map((m, i) => {
    const x = 8 + (i / (MONTHLY_SPEND_TTD.length - 1)) * 84;
    const y = 36 - ((m.amount - min) / (max - min)) * 28;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <svg viewBox="0 0 100 44" className="h-14 w-full" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {MONTHLY_SPEND_TTD.map((m, i) => {
          const x = 8 + (i / (MONTHLY_SPEND_TTD.length - 1)) * 84;
          const y = 36 - ((m.amount - min) / (max - min)) * 28;
          return <circle key={m.month} cx={x} cy={y} r="2" fill="#16a34a" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-slate-400">
        {MONTHLY_SPEND_TTD.map((m) => (
          <span key={m.month}>{m.month}</span>
        ))}
      </div>
    </div>
  );
}

function MiniBars() {
  /** Savings ramp as efficiency measures take effect Jan → Jun (25% target) */
  const heights = [18, 32, 48, 62, 78, 100];
  return (
    <div className="mt-3 flex h-14 items-end justify-between gap-1" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={MONTHLY_SPEND_TTD[i].month}
          className="flex-1 rounded-t bg-emerald-400/80"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function NavLink({
  item,
  authGateHref,
}: {
  item: (typeof NAV)[0];
  authGateHref?: string | null;
}) {
  const href =
    'external' in item && item.external ? item.href : resolveAppHref(item.href, authGateHref);
  const cls = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    item.active
      ? 'bg-sky-500 text-white shadow-md'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`;

  if ('external' in item && item.external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <span aria-hidden>{item.icon}</span>
        {item.label}
      </a>
    );
  }
  if (item.active) {
    return (
      <span className={cls}>
        <span aria-hidden>{item.icon}</span>
        {item.label}
      </span>
    );
  }
  return (
    <Link href={href} className={cls}>
      <span aria-hidden>{item.icon}</span>
      {item.label}
    </Link>
  );
}

export function GreenularityDashboard({
  sessionProfile,
  authGateHref,
  eventLive,
  error,
  launched,
}: Props) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0f2744] text-white lg:flex">
        <div className="border-b border-white/10 p-4">
          <GreenularityLogo size="md" onDark priority href="/" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} authGateHref={authGateHref} />
          ))}
        </nav>

        <div className="m-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4">
          <p className="text-xs font-semibold text-emerald-300">Help Reduce Our Carbon Footprint</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-500/50 bg-emerald-900/50 text-lg">
              🌿
            </div>
            <div>
              <p className="text-lg font-bold text-white">245 kg CO₂</p>
              <p className="text-xs text-emerald-200/80">saved this month (illustrative)</p>
            </div>
          </div>
          <Link href="/calculator" className="mt-3 inline-block text-xs font-semibold text-emerald-400 hover:underline">
            View Impact →
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span aria-hidden>📍</span>
            <span>Port of Spain, Trinidad &amp; Tobago</span>
            <span className="text-slate-300">|</span>
            <span aria-hidden>☀️</span>
            <span>29°C</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="relative rounded-full p-2 hover:bg-slate-100" aria-label="Notifications">
              🔔
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-slate-100" aria-label="Help">
              ❓
            </button>
            <Suspense fallback={
              <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm">👤</div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-800">Hi, Guest</p>
                  <p className="text-slate-500">Sign in to continue</p>
                </div>
              </div>
            }>
              <HomeSignInSheet profile={sessionProfile ?? null} />
            </Suspense>
          </div>
        </header>

        {/* Mobile nav strip */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f2744] px-4 py-3 lg:hidden">
          <GreenularityLogo size="sm" onDark href="/" />
          <Link
            href={resolveAppHref('/calculator', authGateHref)}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white"
          >
            Calculator
          </Link>
        </div>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">
          {(error || launched) && (
            <div className="mb-4 space-y-2">
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                  {error}.{' '}
                  <Link href={eventLive ? EVENT_JOIN_PATH : '/login'} className="font-semibold underline">
                    Sign in
                  </Link>
                </p>
              )}
              {launched && (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Launch successful — open the calculator to begin.
                </p>
              )}
            </div>
          )}

          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/90 via-emerald-900/85 to-teal-900/90 shadow-xl">
            <div
              className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80')] bg-cover bg-center opacity-30"
              aria-hidden
            />
            <div className="relative grid gap-6 p-6 lg:grid-cols-3 lg:p-8">
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Understand. Optimize. Save.{' '}
                  <span className="text-emerald-300">Power a Better Caribbean.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/95 sm:text-base">
                  {SITE.description} The calculator turns your utility bill into savings scenarios,
                  payback estimates, and a prioritized path to cut your bill by at least 25%.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={resolveAppHref('/bills', authGateHref)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600"
                  >
                    📤 Upload Electricity Bill
                  </Link>
                  <Link
                    href={resolveAppHref('/audit', authGateHref)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                  >
                    Start New Audit →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-2xl lg:mt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monthly Spend
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">TT${JUN_SPEND.toFixed(2)}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  ↓ {SPEND_DROP_PCT}% Jan – Jun{' '}
                  <span className="font-normal text-slate-400">(illustrative savings path)</span>
                </p>
                <SpendTrendChart />
                <p className="mt-2 text-[10px] text-slate-400">
                  TT${JAN_SPEND} Jan → TT${JUN_SPEND} Jun · T&amp;TEC Commercial B example
                </p>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_ACTIONS.map((action) => {
              const href =
                'external' in action && action.external
                  ? action.href
                  : resolveAppHref(action.href, authGateHref);
              const inner = (
                <>
                  <span className="text-2xl" aria-hidden>
                    {action.icon}
                  </span>
                  <p className="mt-2 font-semibold text-slate-800">{action.title}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{action.desc}</p>
                </>
              );
              const cls = `rounded-2xl border p-4 transition hover:shadow-md ${action.color}`;
              return action.external ? (
                <a key={action.title} href={href} target="_blank" rel="noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={action.title} href={href} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </section>

          {/* Metrics row */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estimated Monthly Savings
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">TT$105.00</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Potential savings 25%
              </span>
              <MiniBars />
              <p className="mt-2 text-xs text-slate-500">From calculator — AC, refrigeration &amp; sensors</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Top Energy Users
              </p>
              <DonutChart />
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {END_USE.map((e) => (
                  <li key={e.label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                      {e.label}
                    </span>
                    <span className="font-semibold">{e.pct}%</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payback Period
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl" aria-hidden>
                  📅
                </span>
                <div>
                  <p className="text-3xl font-bold text-slate-900">6–18</p>
                  <p className="text-sm text-slate-600">months on recommended upgrades</p>
                </div>
              </div>
              <Link href={resolveAppHref('/calculator', authGateHref)} className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:underline">
                Run your numbers →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Carbon Impact
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl" aria-hidden>
                  🌿
                </span>
                <div>
                  <p className="text-3xl font-bold text-emerald-700">245 kg CO₂</p>
                  <p className="text-sm text-slate-600">Reduce your carbon footprint</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Efficiency-first upgrades lower emissions before renewable capex.
              </p>
            </article>
          </section>

          {/* Why calculator + How it works */}
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">How Greenularity Works</h2>
              <p className="mt-1 text-sm text-slate-600">
                {SITE.tagline} — your journey from bill to verified savings.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((step) => (
                  <div key={step.n} className="relative text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800 ring-4 ring-white">
                      {step.n}
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">{step.title}</p>
                    <p className="mt-1 text-xs leading-snug text-slate-500">{step.desc}</p>
                    {step.n < 4 && (
                      <span
                        className="absolute right-0 top-6 hidden w-full translate-x-1/2 border-t-2 border-dashed border-emerald-200 lg:block"
                        aria-hidden
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-emerald-50 p-4">
                <h3 className="font-bold text-emerald-900">Why the calculator helps</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
                  Caribbean bills hide waste in AC, refrigeration, and off-hours load. The calculator
                  converts your T&amp;TEC, JPS, or BL&amp;P invoice into local-currency savings, equipment
                  priorities, and a phased plan — so you know <em>what</em> to fix, <em>what</em> it
                  saves, and <em>when</em> it pays back before calling an engineer.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={resolveAppHref('/calculator', authGateHref)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Open Calculator →
                  </Link>
                  <a
                    href={SITE.bookNowUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-white"
                  >
                    Book Now — cealgreen.com
                  </a>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Activity</h2>
                <Link href={resolveAppHref('/bills', authGateHref)} className="text-xs font-semibold text-emerald-600 hover:underline">
                  View All
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {ACTIVITY.map((a) => (
                  <li key={a.text} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                    <span className="text-lg" aria-hidden>
                      {a.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-400">
                Sample activity — your submissions appear after Calculate.
              </p>
            </aside>
          </section>

          {/* Digitize Decide Decarbonize table */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="font-bold text-slate-900">Greenularity Caribbean™ — Platform at a glance</h2>
              <p className="text-sm text-slate-600">What each stage delivers for your property</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3 font-semibold">Stage</th>
                    <th className="px-6 py-3 font-semibold">What you do</th>
                    <th className="px-6 py-3 font-semibold">What you get</th>
                    <th className="px-6 py-3 font-semibold">Start</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-emerald-50/50">
                    <td className="px-6 py-4 font-bold text-emerald-700">Digitize</td>
                    <td className="px-6 py-4 text-slate-700">
                      Upload bills; capture rooms &amp; equipment
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      Baseline kWh, spend, and end-use split
                    </td>
                    <td className="px-6 py-4">
                      <Link href={resolveAppHref('/bills', authGateHref)} className="font-semibold text-emerald-600 hover:underline">
                        Upload bill →
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-sky-50/50">
                    <td className="px-6 py-4 font-bold text-sky-700">Decide</td>
                    <td className="px-6 py-4 text-slate-700">
                      Review recommendations &amp; payback
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      Savings in local currency, grants, financing options
                    </td>
                    <td className="px-6 py-4">
                      <Link href={resolveAppHref('/recommendations', authGateHref)} className="font-semibold text-sky-600 hover:underline">
                        Recommendations →
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-teal-50/50">
                    <td className="px-6 py-4 font-bold text-teal-700">Decarbonize</td>
                    <td className="px-6 py-4 text-slate-700">
                      Implement with CEAL Green; track bills
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      Verified cost &amp; energy savings, lower carbon
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={SITE.bookNowUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-teal-600 hover:underline"
                      >
                        Book Now →
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-[#0f2744] px-6 py-4 text-sm text-slate-300 sm:flex-row">
          <div className="flex items-center gap-2">
            <span aria-hidden>🛡️</span>
            <p>
              Your data is secure and private. Bill text is processed locally; cohort submissions
              save only what you confirm.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy" className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10">
              Learn More
            </Link>
            <a
              href={SITE.marketplaceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10"
            >
              Ludwitt Marketplace
            </a>
            <a
              href={SITE.bookNowUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600"
            >
              Book CEAL Green →
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
