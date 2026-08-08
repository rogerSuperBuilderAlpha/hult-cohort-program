import Image from "next/image";
import Link from "next/link";
import { isDemoMode } from "@/lib/app-config";
import { hasLudwittCredentials } from "@/lib/ludwitt/config";
import { getSession } from "@/lib/session";

const ERROR_COPY: Record<string, string> = {
  missing_code: "Ludwitt did not return an authorization code.",
  invalid_state: "OAuth state mismatch. Try signing in again.",
  token_exchange: "Could not exchange the Ludwitt auth code for tokens.",
  not_configured: "Ludwitt credentials are not configured yet.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const demo = isDemoMode();
  let loggedIn = false;

  try {
    const session = await getSession();
    loggedIn = Boolean(session.isLoggedIn && session.user);
  } catch {
    loggedIn = false;
  }

  const ludwittReady = !demo && hasLudwittCredentials();
  const errorMessage = error
    ? ERROR_COPY[error] || `Sign-in error: ${error}`
    : null;

  return (
    <main className="atmosphere min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between rise">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="InterviewForge"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <p
              className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-fog sm:text-3xl"
              style={{ fontVariationSettings: '"SOFT" 40, "WONK" 0' }}
            >
              InterviewForge
            </p>
          </div>
          {loggedIn ? (
            <Link href="/practice" className="btn-ghost text-sm">
              Open practice
            </Link>
          ) : null}
        </header>

        <section className="relative mt-16 flex flex-1 flex-col justify-center pb-10 sm:mt-20">
          <div className="max-w-3xl">
            <p className="rise rise-delay-1 mb-5 text-sm uppercase tracking-[0.22em] text-mist">
              {demo ? "Local demo mode" : "Interview prep on Ludwitt"}
            </p>
            <h1
              className="rise rise-delay-1 font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-fog sm:text-7xl"
              style={{
                fontVariationSettings: '"SOFT" 30, "WONK" 35, "opsz" 72',
              }}
            >
              InterviewForge
            </h1>
            <div className="rise rise-delay-2 ember-line my-7" />
            <p className="rise rise-delay-2 max-w-xl text-lg leading-relaxed text-mist sm:text-xl">
              Drill behavioral stories, system design, and algorithm talk-throughs.
              {demo
                ? " Explore the full practice flow locally — no Ludwitt account required."
                : " Sign in with Ludwitt so every session lands as a tracked event on the platform."}
            </p>

            <div className="rise rise-delay-3 mt-10 flex flex-wrap items-center gap-3">
              {loggedIn ? (
                <Link href="/practice" className="btn-primary">
                  Continue practicing
                </Link>
              ) : demo || ludwittReady ? (
                <a href="/api/auth/login" className="btn-primary">
                  {demo ? "Start practicing" : "Sign in with Ludwitt"}
                </a>
              ) : (
                <span className="btn-primary opacity-60">
                  Add Ludwitt credentials to launch
                </span>
              )}
            </div>

            {errorMessage ? (
              <p className="mt-6 rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            {demo ? (
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist/90">
                Running in demo mode. Events stay on this machine. When you are
                ready to integrate, set <code className="text-ember">DEMO_MODE=false</code>{" "}
                and add Ludwitt client credentials in{" "}
                <code className="text-ember">.env.local</code>.
              </p>
            ) : null}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-8 right-[-8%] hidden w-[42%] rounded-full bg-[radial-gradient(circle_at_center,rgba(232,161,74,0.18),transparent_65%)] lg:block"
          />
        </section>
      </div>
    </main>
  );
}
