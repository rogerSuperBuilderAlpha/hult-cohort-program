import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PeopleDirectory } from "@/components/PeopleDirectory";
import { ALL_SKILLS, CAMPUSES, PEOPLE } from "@/lib/people";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Browse Hult Cohort Summer Pilot developer profiles — filter by campus and skill, open GitHub and deploy links.",
};

export default function DevelopersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Developers
        </h1>
        <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
          Real Summer Pilot builders ship with public deploys. Additional
          profiles are marked Sample data so partners can still walk the
          directory UX.
        </p>
        <div className="mt-8">
          <PeopleDirectory
            people={PEOPLE}
            campuses={CAMPUSES}
            skills={ALL_SKILLS}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
