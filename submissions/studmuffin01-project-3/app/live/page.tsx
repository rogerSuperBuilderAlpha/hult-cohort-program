import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CohortActivityFeed } from "@/components/CohortActivityFeed";
import { getCohortActivity } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Live feed",
  description:
    "Cohort-wide activity — deployments, updates, and shipping signals from the Summer Pilot.",
};

export default function LivePage() {
  const items = getCohortActivity();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
        <p className="flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--signal)]">
          <span className="signal-bar inline-block h-2 w-2 bg-[var(--ok)]" />
          Live feed
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Cohort in motion
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          Continuous updates from builders and projects — watch the work ship.
        </p>
        <div className="mt-8">
          <CohortActivityFeed items={items} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
