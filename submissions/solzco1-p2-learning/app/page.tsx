import Link from "next/link";
import { getSession } from "@/lib/ludwitt/session";
import { ludwittConfigured } from "@/lib/config";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { auth_error?: string; launch_error?: string };
}) {
  const session = await getSession();
  const oauthReady = ludwittConfigured();
  const error = searchParams.auth_error ?? searchParams.launch_error;

  return (
    <main className="min-h-screen">
      <header className="border-b border-forge-slate/20 bg-forge-ink text-forge-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-forge-gold">
              Hult Phase 2 · Learning App
            </p>
            <h1 className="text-2xl font-semibold">DealForge</h1>
          </div>
          {session ? (
            <Link href="/learn" className="text-forge-gold hover:text-white">
              Continue learning →
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {error ? (
          <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            Sign-in failed: {error.replace(/_/g, " ")}
          </div>
        ) : null}

        <div className="rounded-lg border border-forge-slate/15 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-forge-ink">
            Winning High-Value B2B Clients & Enterprise Contracts
          </h2>
          <p className="mt-3 text-forge-muted leading-relaxed">
            Three focused lessons on enterprise discovery, CFO-ready business
            cases, and multi-stakeholder negotiation — built for cohort reps
            selling into large accounts.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-forge-slate">
            <li>• Lesson 1 — Enterprise discovery & buying committee mapping</li>
            <li>• Lesson 2 — CFO-ready business case structure</li>
            <li>• Lesson 3 — Negotiation levers & contract close</li>
            <li>• Capstone quiz — 3 scenario questions</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            {session ? (
              <Link
                href="/learn"
                className="inline-flex rounded bg-forge-ink px-5 py-2.5 text-sm font-medium text-forge-paper hover:bg-forge-slate"
              >
                Open curriculum
              </Link>
            ) : oauthReady ? (
              <a
                href="/api/auth/ludwitt/login"
                className="inline-flex rounded bg-forge-gold px-5 py-2.5 text-sm font-medium text-forge-ink hover:bg-forge-copper hover:text-white"
              >
                Sign in with Ludwitt
              </a>
            ) : (
              <p className="text-sm text-forge-muted">
                Ludwitt OAuth not configured — add credentials to{" "}
                <code className="rounded bg-forge-paper px-1">.env.local</code>
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-forge-muted">
          Powered by Ludwitt Learning Engineers · OAuth PKCE + event tracking
        </p>
      </section>
    </main>
  );
}
