import FiresideHeroBackground from "@/components/FiresideHeroBackground";
import { SignInForm } from "@/components/SignInForm";
import { forthHomeUrl } from "@/lib/forth";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FiresideHeroBackground variant="auth" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-xl lg:mx-0">
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gold)] drop-shadow-md">
              Gather around
            </p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-[#f0e9c8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              The cohort&apos;s collaboration circle — channels, DMs, and
              threads, linked to Forth so conversation becomes owned tickets.
            </p>
            <a
              href={forthHomeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex font-[family-name:var(--font-ibm-plex-mono)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold)] underline decoration-[var(--gold)]/40 underline-offset-4 hover:text-white"
            >
              Open Forth ↗
            </a>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 lg:px-10 lg:pb-16 lg:pt-16">
          <div className="w-full max-w-md border-[1.5px] border-[var(--line)] bg-[var(--surface-elevated)] p-8 shadow-[4px_4px_0_#1a2421]">
            <h2 className="font-[family-name:var(--font-source-serif)] text-2xl font-semibold text-[var(--ink)]">
              Sign in
            </h2>
            <p className="mt-1 font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[var(--ink-muted)]">
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
