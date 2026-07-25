import Image from "next/image";
import Link from "next/link";
import { ConexusMark } from "@/components/ConexusMark";

const FEATURES = [
  {
    title: "Chat",
    description: "Have meaningful conversations in one place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M5 17.5V7.8A2.8 2.8 0 0 1 7.8 5h8.4A2.8 2.8 0 0 1 19 7.8v5.4a2.8 2.8 0 0 1-2.8 2.8H9.2L5 19.2v-1.7Z"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="11" r="1" fill="var(--color-primary)" />
        <circle cx="12" cy="11" r="1" fill="var(--color-primary)" />
        <circle cx="15" cy="11" r="1" fill="var(--color-primary)" />
      </svg>
    ),
  },
  {
    title: "Collaborate",
    description: "Work together in real time with your team and AI.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <circle cx="9" cy="8" r="2.4" stroke="var(--color-primary)" strokeWidth="1.8" />
        <circle cx="16" cy="9" r="2.1" stroke="var(--color-primary)" strokeWidth="1.8" />
        <path
          d="M4.5 18.5c.6-2.4 2.5-3.8 4.5-3.8s3.9 1.4 4.5 3.8"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M13.2 15.2c.7-.4 1.6-.6 2.8-.6 1.8 0 3.3 1 3.9 2.9"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Share Files",
    description: "Store, organize, and share files securely.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M8 4.5h5.2L17.5 9v10.5A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 4.5Z"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13 4.5V9h4.5"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 13.5h5M9.5 16.5h3.5"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

const ctaClassName =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] font-semibold no-underline transition hover:brightness-95 !text-[var(--color-dark)]";

export default function LandingPage() {
  return (
    <main
      data-testid="landing-page"
      className="min-h-full bg-[var(--color-dark)] text-white"
    >
      <section className="relative isolate min-h-[min(100vh,52rem)] overflow-hidden">
        <Image
          src="/images/hero_image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Keep left copy readable over the network graphic */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-dark)_0%,color-mix(in_srgb,var(--color-dark)_78%,transparent)_42%,transparent_72%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[min(100vh,52rem)] w-full max-w-6xl flex-col px-5 md:px-8">
          <header className="flex items-center justify-between py-5 md:py-6">
            <Link
              href="/"
              className="flex items-center gap-3 !text-white no-underline"
              aria-label="Conexus home"
            >
              <ConexusMark />
              <span className="text-sm font-semibold tracking-[0.18em] uppercase">
                Conexus
              </span>
            </Link>
            <Link
              href="/login"
              data-testid="landing-nav-cta"
              className={`${ctaClassName} px-4 py-2 text-sm`}
            >
              Get Started
            </Link>
          </header>

          <div className="flex flex-1 flex-col justify-center pb-16 pt-6 md:pb-20 md:pt-10">
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                Conexus
              </h1>
              <p className="mt-5 text-xl font-medium leading-snug text-white md:text-2xl">
                From conversation to{" "}
                <span className="text-[var(--color-primary)]">coordination.</span>
              </p>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
                The shared intelligence platform that brings people, teams, and AI
                together to communicate, collaborate, and coordinate work that
                matters.
              </p>
              <Link
                href="/login"
                data-testid="landing-hero-cta"
                className={`${ctaClassName} mt-8 px-6 py-3 text-base shadow-[0_0_28px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]`}
              >
                Get Started <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        data-testid="landing-features"
        className="border-t border-white/10 bg-[color-mix(in_srgb,var(--color-dark)_92%,black)]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 md:grid-cols-3 md:gap-10 md:px-8 md:py-16">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
                {feature.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{feature.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
