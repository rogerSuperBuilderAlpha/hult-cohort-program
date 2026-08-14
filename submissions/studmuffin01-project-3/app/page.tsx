import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CohortStatusPanel } from "@/components/CohortStatusPanel";
import { CohortActivityFeed } from "@/components/CohortActivityFeed";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import LighthouseHeroBackground from "@/components/LighthouseHeroBackground";
import { getCohortActivity } from "@/lib/activity";
import { COHORT, COHORT_NARRATIVE } from "@/lib/cohort";
import { PEOPLE } from "@/lib/people";
import {
  formatRelativeTime,
  getLastDeployment,
} from "@/lib/projects";

/** Public showcase — deploy root partners should land on first. */
export default function HomePage() {
  const realPublic = PEOPLE.filter(
    (p) => p.privacy === "public" && !p.isDemo
  ).length;
  const sampleCount = PEOPLE.filter((p) => p.isDemo).length;
  const lastDeploy = getLastDeployment();
  const activity = getCohortActivity().slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative min-h-screen overflow-x-clip">
        <LighthouseHeroBackground />
        <SiteHeader variant="hero" />

        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-6xl flex-col justify-center px-5 pb-20 pt-6 sm:px-8">
          <section className="animate-rise max-w-xl overflow-visible">
            <p className="font-[family-name:var(--font-jetbrains)] text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--signal)]">
              {COHORT.term} · public showcase
            </p>
            <h1 className="brand-wordmark animate-rise-delay mt-3">
              Lighthouse
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
              <span className="block">Let the light guide you —</span>
              <span className="mt-2 block">
                To credible developers… doing the work… building quality
                products… solving real-world challenges… shaping the future.
              </span>
            </p>
            {lastDeploy ? (
              <p className="animate-rise-delay-2 mt-5 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-white/75">
                Last deployment:{" "}
                <Link
                  href={`/projects/${lastDeploy.project.id}`}
                  className="text-[var(--signal)] hover:underline"
                >
                  {lastDeploy.project.name}
                </Link>{" "}
                · {formatRelativeTime(lastDeploy.at)}
              </p>
            ) : null}
            <div className="animate-rise-delay-2 mt-9 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex h-12 items-center justify-center bg-[var(--signal)] px-6 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal-ink)] transition hover:brightness-110"
              >
                Explore projects
              </Link>
              <Link
                href="/developers"
                className="inline-flex h-12 items-center justify-center border border-white/50 bg-black/25 px-6 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
              >
                Meet the cohort
              </Link>
              <Link
                href="/partners"
                className="inline-flex h-12 items-center justify-center border border-white/50 bg-black/25 px-6 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
              >
                Partner with us
              </Link>
            </div>
          </section>
        </main>
      </div>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              Activity feed
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Seeded shipping signals from real profiles — not a live webhook
              feed.
            </p>
          </div>
          <Link
            href="/live"
            className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
          >
            View full feed →
          </Link>
        </div>
        <div className="mt-6">
          <CohortActivityFeed items={activity} compact />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
          Cohort journey
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Where the Summer Pilot is right now.
        </p>
        <div className="mt-6">
          <JourneyTimeline />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
              {COHORT.name}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              {COHORT.term} · {COHORT.campuses.join(" · ")}
            </p>
            <p className="mt-6 text-base leading-relaxed text-[var(--ink-muted)]">
              {COHORT_NARRATIVE}
            </p>
          </div>
          <div className="space-y-4">
            <div className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
              <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                Roster signal
              </p>
              <p className="mt-2 font-[family-name:var(--font-syne)] text-4xl font-bold text-[var(--ink)]">
                {realPublic}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                real public profiles · {sampleCount} sample · for directory UX
              </p>
            </div>
            <CohortStatusPanel compact />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
