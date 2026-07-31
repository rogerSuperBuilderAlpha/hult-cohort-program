import Link from "next/link";
import FiresideHeroBackground from "@/components/FiresideHeroBackground";
import { forthHomeUrl } from "@/lib/forth";

export default function HomePage() {
  const forthUrl = forthHomeUrl();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FiresideHeroBackground variant="landing" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-end px-6 py-6 sm:px-10">
        <nav className="flex items-center gap-3 font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.1em]">
          <a
            href={forthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden border border-white/40 bg-black/25 px-3 py-2 text-white/90 shadow-[2px_2px_0_rgba(0,0,0,0.35)] transition hover:bg-black/40 hover:text-white sm:inline"
          >
            Open Forth
          </a>
          <Link
            href="/signin"
            className="border-[1.5px] border-[#1a2421] bg-[#f0e9c8] px-4 py-2 text-[#1a2421] shadow-[2px_2px_0_#1a2421] transition hover:bg-white hover:text-[#1a2421]"
            style={{ color: "#1a2421" }}
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col justify-center px-6 pb-16 pt-6 sm:px-10">
        <section className="animate-rise max-w-xl">
          <p className="mb-4 font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)] drop-shadow-md">
            Team collaboration · paired with Forth
          </p>
          <h1 className="font-[family-name:var(--font-source-serif)] text-5xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl">
            Fireside
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
            Gather the cohort around channels, DMs, and threads — wired to Forth
            so conversation becomes owned tickets.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signin"
              className="inline-flex h-12 items-center justify-center border-[1.5px] border-[#1a2421] bg-[#f0e9c8] px-6 font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.1em] shadow-[3px_3px_0_#1a2421] transition hover:bg-white hover:shadow-[2px_2px_0_#1a2421]"
              style={{ color: "#1a2421" }}
            >
              Sign in to Fireside
            </Link>
            <Link
              href="/workspace"
              className="inline-flex h-12 items-center justify-center border-[1.5px] border-[#1a2421] bg-[#8e8a66] px-6 font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.1em] shadow-[3px_3px_0_#1a2421] transition hover:bg-[#a39e78] hover:shadow-[2px_2px_0_#1a2421]"
              style={{ color: "#1a2421" }}
            >
              Enter workspace
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
