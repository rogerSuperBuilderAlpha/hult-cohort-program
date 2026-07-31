import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RsvpForm } from "@/components/RsvpForm";
import { COHORT } from "@/lib/cohort";

export const metadata: Metadata = {
  title: "Showcase RSVP",
  description: `RSVP for the ${COHORT.showcaseEvent.title} — ${COHORT.showcaseEvent.when}.`,
};

export default function RsvpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 sm:px-8">
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.14em] text-[var(--signal)]">
          Hiring partners
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          {COHORT.showcaseEvent.title}
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          {COHORT.showcaseEvent.when} · {COHORT.showcaseEvent.where}
        </p>
        <div className="mt-8 border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6">
          <RsvpForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
