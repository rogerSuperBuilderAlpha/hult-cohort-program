import type { Metadata } from "next";
import Link from "next/link";
import { RequestIntroForm } from "@/components/RequestIntroForm";

export const metadata: Metadata = {
  title: "Partners",
  description: "Hire a builder, sponsor a project, or collaborate on a sprint.",
};

type Props = { searchParams: { developer?: string } };

export default function PartnersPage({ searchParams }: Props) {
  const preselected = searchParams.developer
    ? [searchParams.developer.replace(/^@/, "")]
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Partner Portal</h1>
      <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
        Don&apos;t trust our word — inspect their GitHub. Pulse converts cohort
        momentum into partner action with clear CTAs and streamlined intros.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Hire a Builder</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Full-time or contract engineering roles. Browse profiles, inspect deploys,
              then request a warm intro.
            </p>
            <Link href="/builders" className="btn-primary mt-4 inline-flex text-sm">
              Browse builders
            </Link>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Sponsor a Project</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Fund a cohort sprint or capstone build with defined deliverables and public
              evidence trail.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Collaborate on a Sprint</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Co-build with a student team for 1–2 weeks — ideal for scoped prototypes
              and architecture spikes.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold">Commercial terms</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Referral fee ≈ 25% of first-year base salary on successful hire · 90-day
              clawback · 10% kickback to the candidate. See{" "}
              <code className="text-xs">PARTNERS.md</code> in the repo for full detail.
            </p>
          </div>
        </div>

        <div id="request-intro">
          <RequestIntroForm preselected={preselected} />
        </div>
      </div>
    </div>
  );
}
