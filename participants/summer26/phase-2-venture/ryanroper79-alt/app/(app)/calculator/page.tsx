import { redirect } from 'next/navigation';
import { readSession } from '@/lib/ludwitt/session';
import { Disclaimer } from '@/components/Disclaimer';
import { CalculatorForm } from '@/components/CalculatorForm';
import { isEventModeEnabled, isEventWindowOpen } from '@/lib/event/access';
import type { JurisdictionId } from '@/lib/energy/tariffs';

const JURISDICTIONS: JurisdictionId[] = [
  'trinidad_tobago',
  'barbados',
  'jamaica',
  'saint_kitts',
  'guyana',
];

function parseJurisdiction(value?: string): JurisdictionId | undefined {
  if (!value) return undefined;
  return JURISDICTIONS.includes(value as JurisdictionId)
    ? (value as JurisdictionId)
    : undefined;
}

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{
    event?: string;
    jurisdiction?: string;
    kwh?: string;
    spend?: string;
  }>;
}) {
  const session = await readSession();
  if (!session) redirect('/?signin=1');

  const params = await searchParams;
  const eventMode =
    (isEventModeEnabled() && isEventWindowOpen()) || params.event === '1';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ceal-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ceal-900">Energy calculator</h2>
        <p className="mt-2 text-sm text-ceal-800/80">
          {session.name ? (
            <>
              Hi {session.name.split(/\s+/)[0]}, enter your bill details from T&amp;TEC, JPS,
              BL&amp;P, or SKELEC — then Calculate to save and see your savings plan.
            </>
          ) : eventMode ? (
            'Enter your bill details from T&TEC, JPS, BL&P, or SKELEC — then Calculate to save and see your savings plan.'
          ) : (
            'Enter your property details. Prefer actual kWh from your bill when available.'
          )}
        </p>
        <CalculatorForm
          eventMode={eventMode}
          initialJurisdiction={parseJurisdiction(params.jurisdiction)}
          initialKwh={params.kwh}
          initialSpend={params.spend}
          initialEmail={session.email}
          initialCompanyName={session.companyName ?? session.name ?? ''}
        />
      </section>
      <Disclaimer />
    </div>
  );
}
