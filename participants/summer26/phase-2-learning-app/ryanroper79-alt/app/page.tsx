import Link from 'next/link';
import { readLearnerSession } from '@/lib/ludwitt';
import { lessons } from '@/lib/lessons';

export default async function HomePage() {
  const session = await readLearnerSession();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-leaf-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-leaf-900">Learn climate skills in three short lessons</h2>
        <p className="mt-3 text-leaf-900/80">
          Built for the Hult Cohort Developer Program — Week 4 Ludwitt integration. Launch from the platform
          directory so your session is authenticated and learning events count toward cohort metrics.
        </p>
        {!session ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Open this app from the Ludwitt/Hult launcher to receive a signed JWT on <code>/launch</code>.
          </p>
        ) : (
          <p className="mt-4 rounded-lg bg-leaf-500/10 px-4 py-3 text-sm text-leaf-800">
            Signed in as <strong>{session.email}</strong>. Pick a lesson below.
          </p>
        )}
      </section>

      <section className="grid gap-4">
        {lessons.map((lesson) => (
          <article key={lesson.id} className="rounded-xl border border-leaf-500/15 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">{lesson.title}</h3>
            <p className="mt-1 text-sm text-leaf-900/70">{lesson.summary}</p>
            {session ? (
              <Link
                href={`/lesson/${lesson.id}`}
                className="mt-4 inline-flex rounded-lg bg-leaf-700 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-900"
              >
                Start lesson
              </Link>
            ) : (
              <p className="mt-4 text-sm text-leaf-700/70">Launch from Ludwitt to begin.</p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
