import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CohortActivityFeed } from "@/components/CohortActivityFeed";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { getCohortActivity } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Activity feed (seeded)",
  description:
    "Seeded cohort activity from real public profiles and project pages — not a live webhook stream.",
};

export default function LivePage() {
  const items = getCohortActivity();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--signal)]">
            Activity feed
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Seeded shipping signals
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          Entries come from real public profiles and platform project pages in
          this repo. This is not a live GitHub/Vercel webhook feed — treat it as
          illustrative motion for partners walking the showcase.
        </p>
        <div className="mt-8">
          <CohortActivityFeed items={items} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
