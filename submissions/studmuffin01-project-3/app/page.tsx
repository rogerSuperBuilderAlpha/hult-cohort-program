import type { Metadata } from "next";
import Link from "next/link";
import LighthouseHeroBackground from "@/components/LighthouseHeroBackground";
import { SignInForm } from "@/components/SignInForm";
import { COHORT } from "@/lib/cohort";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Enter Lighthouse to browse the cohort showcase — or continue as guest with no account.",
};

/** Deploy root — first page visitors see. */
export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LighthouseHeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-xl lg:mx-0">
            <p className="font-[family-name:var(--font-jetbrains)] text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--signal)]">
              {COHORT.term} · public showcase
            </p>
            <h1 className="brand-wordmark mt-3">Lighthouse</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
              <span className="block">Let the light guide you —</span>
              <span className="mt-2 block">
                To credible developers… doing the work… building quality
                products… solving real-world challenges… shaping the future.
              </span>
            </p>
            <Link
              href="/home"
              className="mt-8 inline-flex font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal)] underline decoration-[var(--signal)]/40 underline-offset-4 hover:text-white"
            >
              Skip to showcase →
            </Link>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 lg:px-10 lg:pb-16 lg:pt-16">
          <div className="w-full max-w-md border border-white/20 bg-[var(--bg-elevated)]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold text-[var(--ink)]">
              Sign in
            </h2>
            <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-muted)]">
              Optional for demo — or continue as guest to review the app.
            </p>
            <div className="mt-6">
              <SignInForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
