import type { Metadata } from "next";
import { BuilderCard } from "@/components/BuilderCard";
import { publicBuilders } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Builders",
  description: "Participant profiles for the Hult Developer Cohort Summer Pilot 2026.",
};

export default function BuildersPage() {
  const builders = publicBuilders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">The Builders</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
        {builders.length} enrolled participants with public opt-in profiles. Each card
        links to GitHub, signature projects, and Quick Connect for partners.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {builders.map((b) => (
          <BuilderCard key={b.handle} builder={b} />
        ))}
      </div>
    </div>
  );
}
