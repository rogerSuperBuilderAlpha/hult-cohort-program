import { redirect } from 'next/navigation';
import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { Disclaimer } from '@/components/Disclaimer';
import { isEventModeEnabled, isEventWindowOpen } from '@/lib/event/access';
import { EVENT_JOIN_PATH, SITE } from '@/lib/site';

const RECOMMENDATIONS = [
  {
    title: 'High-efficiency AC & plant optimization',
    savings: 'Often 12–22% of cooling spend',
    href: '/calculator',
    tag: 'Priority',
  },
  {
    title: 'Refrigeration efficiency package',
    savings: '15–28% of cold-room / display case load',
    href: '/calculator',
    tag: '24/7 loads',
  },
  {
    title: 'Remote sensors & building controls',
    savings: '6–14% through scheduling and visibility',
    href: '/calculator',
    tag: 'Quick win',
  },
  {
    title: 'LED lighting retrofit',
    savings: '40–65% of lighting energy',
    href: '/lighting',
    tag: 'Fast payback',
  },
  {
    title: 'Equipment upgrades',
    savings: 'Motors, pumps, and process drives',
    href: '/equipment',
    tag: 'Commercial',
  },
];

export default async function RecommendationsPage() {
  const session = await readSession();
  if (!session) {
    const eventLive = isEventModeEnabled() && isEventWindowOpen();
    redirect(eventLive ? EVENT_JOIN_PATH : '/login?error=auth_required');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Recommendations</h1>
        <p className="mt-2 text-sm text-slate-600">
          Illustrative measures from your calculator profile — run Calculate for personalized local-currency
          savings and payback bands targeting at least 25% off your monthly bill.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RECOMMENDATIONS.map((r) => (
            <article
              key={r.title}
              className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
            >
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {r.tag}
              </span>
              <h2 className="mt-2 font-bold text-slate-900">{r.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{r.savings}</p>
              <Link
                href={r.href}
                className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
              >
                Explore →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-[#0f2744] p-5 text-white">
          <p className="font-bold">Ready for engineer-validated quotes?</p>
          <p className="mt-1 text-sm text-slate-200">
            CEAL Green prioritizes installs within your budget over months — not guesswork.
          </p>
          <a
            href={SITE.bookNowUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600"
          >
            Book Now at cealgreen.com →
          </a>
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}
