import { redirect } from 'next/navigation';
import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { Disclaimer } from '@/components/Disclaimer';
import { isEventModeEnabled, isEventWindowOpen } from '@/lib/event/access';
import { EVENT_JOIN_PATH, SITE } from '@/lib/site';

export default async function AuditPage() {
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
        <h1 className="mt-3 text-2xl font-bold text-slate-900">My Energy Audit</h1>
        <p className="mt-2 text-sm text-slate-600">
          Capture how your building uses energy — floor area, operating hours, and major loads — so
          Greenularity can estimate end-use splits and audit readiness.
        </p>

        <ol className="mt-6 space-y-4">
          {[
            {
              step: '1',
              title: 'Upload your latest bill',
              detail: 'Start with kWh and spend from My Bills.',
              href: '/bills',
            },
            {
              step: '2',
              title: 'Describe your property',
              detail: 'Floor area (m² or ft²), weekly hours, commercial vs residential.',
              href: '/calculator',
            },
            {
              step: '3',
              title: 'Select major loads',
              detail: 'AC, refrigeration, lighting, motors — Caribbean commercial priorities.',
              href: '/calculator',
            },
            {
              step: '4',
              title: 'Book a CEAL site audit',
              detail: 'Engineers validate findings and build a phased install plan.',
              href: SITE.bookNowUrl,
              external: true,
            },
          ].map((item) => (
            <li
              key={item.step}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-bold text-emerald-600">Step {item.step}</p>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.detail}</p>
              </div>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Book Now →
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="shrink-0 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  Open →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
      <Disclaimer />
    </div>
  );
}
