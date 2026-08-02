import type { Metadata } from "next";
import { ShowcaseGrid } from "@/components/ShowcaseProjectCard";
import { SHOWCASE_PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Showcase",
  description: "Live deployments, architecture breakdowns, and project evidence.",
};

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">The Showcase</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
        Project evidence framed through a business lens — problem solved, speed to
        market, and technical complexity. Toggle{" "}
        <strong className="text-[var(--ink)]">Under the Hood</strong> on any card for
        architecture flow.
      </p>
      <div className="mt-10">
        <ShowcaseGrid projects={SHOWCASE_PROJECTS} />
      </div>
    </div>
  );
}
