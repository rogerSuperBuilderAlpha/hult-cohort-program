import type { Metadata } from "next";
import { Suspense } from "react";
import { IntroForm } from "@/components/IntroForm";
import { PageHero } from "@/components/PageHero";
import { publicParticipants } from "@/lib/participants";

export const metadata: Metadata = {
  title: "Request intro",
  description:
    "Request an introduction to Summer Pilot participants via the placement lead.",
};

export default function IntroPage() {
  const people = publicParticipants();
  const handles = people.map((p) => p.handle);
  const skillMap = Object.fromEntries(people.map((p) => [p.handle, p.skills]));

  return (
    <section className="section !pt-28 !pb-24">
      <PageHero
        kicker="Placement"
        title="Request an intro."
        lead="Tap student chips to build a shortlist — watch skill coverage fill the meter. Placement confirms opt-in within 24 hours."
      />
      <div className="mt-10">
        <Suspense fallback={<p className="text-[var(--fog)]">Loading form…</p>}>
          <IntroForm handles={handles} skillMap={skillMap} />
        </Suspense>
      </div>
    </section>
  );
}
