import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RequestIntroForm } from "@/components/RequestIntroForm";
import { COHORT } from "@/lib/cohort";
import { INDUSTRY_PARTNERS } from "@/lib/industry-partners";
import { publicPeople } from "@/lib/people";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Sponsor and employer landing — evaluate Hult Cohort developers on GitHub, then request an intro.",
};

type Props = {
  searchParams: Promise<{ developer?: string }>;
};

export default async function PartnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const developer = params.developer?.trim() ?? "";
  const candidates = publicPeople().map((person) => ({
    handle: person.handle,
    name: person.name,
  }));
  const preselected =
    developer && candidates.some((c) => c.handle === developer)
      ? [developer]
      : [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--signal)]">
          Sponsors & employers
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Partners
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
          This is where sponsors and employers land. Don&apos;t trust our word —
          inspect their GitHub. Every review, deploy, and merged PR is public. You
          pay only when you hire.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <section>
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                How to evaluate in ~10 minutes
              </h2>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                <li>
                  <span className="text-[var(--signal)]">1.</span> Open{" "}
                  <Link href="/developers" className="text-[var(--ink)] underline">
                    Developers
                  </Link>{" "}
                  — read Why I&apos;m Here, build log, and project showcase.
                </li>
                <li>
                  <span className="text-[var(--signal)]">2.</span> Check{" "}
                  <strong className="text-[var(--ink)]">Proof of Work</strong> and
                  the <strong className="text-[var(--ink)]">Live / Beta</strong>{" "}
                  deploy badge.
                </li>
                <li>
                  <span className="text-[var(--signal)]">3.</span> Skim Live Summary
                  metrics and homepage cohort status.
                </li>
                <li>
                  <span className="text-[var(--signal)]">4.</span> Request an intro
                  — placement lead routes the conversation.
                </li>
              </ol>
            </section>

            <section className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                Fee model
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                {COHORT.feeSummary}
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                Industry partners
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {INDUSTRY_PARTNERS.map((partner) => (
                  <li
                    key={partner.id}
                    className="border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm"
                  >
                    <p className="font-medium text-[var(--ink)]">{partner.name}</p>
                    <p className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                      {partner.sector}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6 lg:sticky lg:top-6 lg:self-start">
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
              Request intro
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Partner name, company, developer(s), message → placement lead.
            </p>
            <div className="mt-5">
              <RequestIntroForm
                candidates={candidates}
                preselected={preselected}
              />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
