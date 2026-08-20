import { redirect } from 'next/navigation';
import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { BillUploadPanel } from '@/components/BillUploadPanel';
import { Disclaimer } from '@/components/Disclaimer';
import { greetingFirstName } from '@/lib/auth/profile-sign-in';

export default async function BillsPage() {
  const session = await readSession();
  if (!session) redirect('/?signin=1');

  const first = greetingFirstName(session);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {first !== 'Guest' ? `My Bills — Hi, ${first}` : 'My Bills'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Digitize your electricity invoices — paste T&amp;TEC, JPS, BL&amp;P, or SKELEC bill text, or
          photograph your paper bill. Bills are linked to your account ({session.email}) for secure
          review of discrepancies and inconsistencies.
        </p>
        <BillUploadPanel calculatorHref="/calculator" />
      </section>
      <Disclaimer />
    </div>
  );
}
