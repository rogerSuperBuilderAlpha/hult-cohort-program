import Link from "next/link";
import { redirect } from "next/navigation";
import { LESSONS, MODULE_TITLE } from "@/lib/lessons";
import { getSession } from "@/lib/ludwitt/session";
import { CreditsBadge } from "@/components/CreditsBadge";
export default async function LearnPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="min-h-screen">
      <header className="border-b border-forge-slate/20 bg-forge-ink text-forge-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/" className="text-xs text-forge-gold hover:text-white">
              ← DealForge
            </Link>
            <h1 className="text-xl font-semibold">{MODULE_TITLE}</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-sm text-forge-paper/70 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-forge-muted">
            Signed in as {session.email ?? session.sub}
          </p>
          <CreditsBadge />
        </div>
        <ol className="mt-8 space-y-4">
          {LESSONS.map((lesson, i) => (
            <li
              key={lesson.id}
              className="rounded-lg border border-forge-slate/15 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-forge-gold">
                    Lesson {i + 1} · {lesson.durationMin} min
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{lesson.title}</h2>
                </div>
                <Link
                  href={`/learn/${lesson.id}`}
                  className="shrink-0 rounded bg-forge-ink px-4 py-2 text-sm text-forge-paper hover:bg-forge-slate"
                >
                  Start
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-lg border border-forge-gold/40 bg-forge-gold/10 p-5">
          <h2 className="font-semibold">Capstone quiz</h2>
          <p className="mt-1 text-sm text-forge-muted">
            Three scenario questions covering discovery, business cases, and
            negotiation.
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-flex rounded bg-forge-gold px-4 py-2 text-sm font-medium text-forge-ink hover:bg-forge-copper hover:text-white"
          >
            Take quiz
          </Link>
        </div>
      </section>
    </main>
  );
}
