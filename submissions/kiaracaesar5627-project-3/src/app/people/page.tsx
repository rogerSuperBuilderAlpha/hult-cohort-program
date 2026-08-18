import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PeopleLab } from "@/components/PeopleLab";
import { TrailMarquee } from "@/components/TrailMarquee";
import { PARTICIPANTS, allSkills } from "@/lib/participants";

export const metadata: Metadata = {
  title: "People",
  description:
    "Meet the Summer Pilot builders — public trails, deploys, and GitHub you can inspect before you hire.",
};

export default function PeoplePage() {
  return (
    <>
      <section className="section !pt-28 !pb-6">
        <PageHero
          kicker="The cohort"
          title="Builders. Public trails."
          lead="Every profile is hiring evidence — repos, contest builds, live deploys. Shuffle, surprise-pick, or filter by skill and campus."
        />
      </section>
      <TrailMarquee />
      <section className="section !pt-10 !pb-24">
        <Suspense fallback={<p className="text-[var(--fog)]">Loading directory…</p>}>
          <PeopleLab people={PARTICIPANTS} skills={allSkills()} />
        </Suspense>
      </section>
    </>
  );
}
