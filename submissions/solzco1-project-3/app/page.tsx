import Link from "next/link";
import { BuilderCard } from "@/components/BuilderCard";
import { StatsDashboard } from "@/components/LivePulseTicker";
import { PmStatusPanel } from "@/components/PmStatusPanel";
import { PulseTagline, PulseWordmark } from "@/components/PulseWordmark";
import { ShowcaseGrid } from "@/components/ShowcaseProjectCard";
import { defaultMetrics } from "@/lib/github-activity";
import { pmSnapshot } from "@/lib/pm-snapshot";
import { SHOWCASE_PROJECTS } from "@/lib/projects";
import { publicBuilders } from "@/lib/roster";

export default function HomePage() {
  const snapshot = pmSnapshot;
  const metrics = defaultMetrics();
  const builders = publicBuilders().slice(0, 8);

  return (
    <div className="hero-grid relative">
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <PulseTagline />
        <div className="hero-breathe">
          <PulseWordmark />
        </div>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--ink-muted)] sm:text-xl">
          <strong className="text-[var(--ink)]">
            We are the Hult Developer Cohort.
          </strong>{" "}
          Not junior engineers, but hyper-focused builders shipping production-ready
          systems at the intersection of AI, product, and code.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/builders" className="btn-primary">
            Meet the builders
          </Link>
          <Link href="/partners" className="btn-ghost">
            Hire a builder
          </Link>
        </div>

        <div className="mt-12">
          <StatsDashboard initialMetrics={metrics} />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <PmStatusPanel snapshot={snapshot} />
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">The Builders</h2>
          <Link href="/builders" className="text-sm text-[var(--accent)] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {builders.map((b) => (
            <BuilderCard key={b.handle} builder={b} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-8 font-display text-2xl font-bold">The Showcase</h2>
        <ShowcaseGrid projects={SHOWCASE_PROJECTS.slice(0, 2)} />
        <div className="mt-6 text-center">
          <Link href="/showcase" className="btn-ghost">
            All project evidence →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="glass-card rounded-2xl p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Partner with momentum
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--ink-muted)]">
            Hire a builder, sponsor a sprint, or request a sandbox code review —
            frictionless intros backed by public GitHub evidence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/partners" className="btn-primary">
              Partner portal
            </Link>
            <Link href="/partners#request-intro" className="btn-ghost">
              Request intro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
