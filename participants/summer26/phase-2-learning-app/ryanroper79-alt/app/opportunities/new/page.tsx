import { redirect } from 'next/navigation';
import { readSession } from '@/lib/ludwitt/session';
import { ManualEntryForm } from '@/components/ManualEntryForm';

export default async function NewOpportunityPage() {
  const session = await readSession();
  if (!session) redirect('/');
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Manual opportunity entry</h2>
      <ManualEntryForm />
    </div>
  );
}
