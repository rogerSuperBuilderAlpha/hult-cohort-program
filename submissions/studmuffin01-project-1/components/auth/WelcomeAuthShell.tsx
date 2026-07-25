import GatewayBackground from "@/components/auth/GatewayBackground";

interface WelcomeAuthShellProps {
  children: React.ReactNode;
  formTitle?: string;
  formSubtitle?: string;
}

export default function WelcomeAuthShell({
  children,
  formTitle,
  formSubtitle = "Enter your credentials to access your dashboard.",
}: WelcomeAuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GatewayBackground />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-xl lg:mx-0">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/90 drop-shadow-md">
              Welcome to
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
              INITIARA
            </h1>
            <p className="mt-4 text-xl font-medium text-amber-50/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-2xl">
              The Gateway to Project Success
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
              Step through the gate to manage initiatives, assign tasks to your team, and
              track progress from a single command center.
            </p>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 lg:px-10 lg:pb-16 lg:pt-16 xl:px-14">
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/15 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl ring-1 ring-white/20">
            <div className="mb-6 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/90">
                Welcome to Initiara
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white drop-shadow-md">
                The Gateway to Project Success
              </p>
            </div>

            {formTitle ? (
              <h2 className="font-display text-2xl font-bold text-white drop-shadow-sm">
                {formTitle}
              </h2>
            ) : null}
            {formSubtitle ? (
              <p className={`text-sm text-white/80 ${formTitle ? "mt-1" : ""}`}>{formSubtitle}</p>
            ) : null}

            <div className={formTitle || formSubtitle ? "mt-6" : ""}>{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
