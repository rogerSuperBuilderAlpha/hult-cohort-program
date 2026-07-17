import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-galaxy absolute inset-0">
          <Image
            src="/images/galaxy-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,10,20,0.92) 0%, rgba(6,10,20,0.75) 30%, rgba(6,10,20,0.35) 60%, rgba(6,10,20,0.1) 100%)",
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-wide text-[var(--ink)]/90">
          Mission Control
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center px-6 pb-24 pt-4 sm:px-10 lg:px-16">
        <div className="w-full max-w-[min(100%,28rem)] text-left lg:w-1/3 lg:max-w-none">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--ink)] sm:text-7xl md:text-8xl">
            Mission Control
          </h1>
          <p className="mt-6 max-w-[500px] text-base font-normal leading-relaxed text-[var(--muted)] sm:text-lg">
            Civilizations don&apos;t advance through energy alone. They advance through coordinated
            contributions.
          </p>
        </div>
      </main>
    </div>
  );
}
