import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your protected dashboard.
        </p>
      </div>

      <div className="mb-6 rounded border p-6">
        <h2 className="mb-2 text-xl font-semibold">
          Account Information
        </h2>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>User ID:</strong> {user.id}
        </p>

        <p>
          <strong>Email Confirmed:</strong>{' '}
          {user.email_confirmed_at ? 'Yes' : 'No'}
        </p>
      </div>

      <LogoutButton />
    </main>
  );
}