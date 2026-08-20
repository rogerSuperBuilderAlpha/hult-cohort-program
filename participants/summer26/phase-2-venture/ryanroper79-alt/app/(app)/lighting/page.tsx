import { redirect } from 'next/navigation';
import { readSession } from '@/lib/ludwitt/session';
import { Disclaimer } from '@/components/Disclaimer';
import { LightingEstimator } from '@/components/LightingEstimator';

export default async function LightingPage() {
  const session = await readSession();
  if (!session) redirect('/login?error=auth_required');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">Lighting retrofit estimator</h2>
        <LightingEstimator />
      </section>
      <Disclaimer />
    </div>
  );
}
