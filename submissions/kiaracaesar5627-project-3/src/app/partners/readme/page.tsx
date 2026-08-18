import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Partner README",
  description:
    "Partner-facing README for Trailmark — the Hult Cohort Summer Pilot public showcase.",
};

export default function PartnerReadmePage() {
  return (
    <section className="section !pt-24 !pb-24">
      <PageHero
        kicker="Document"
        title="Partner README"
        lead="Canonical partner brief also lives in the repo as PARTNERS.md."
      />

      <ScrollReveal className="mt-10 max-w-3xl space-y-6 text-[var(--fog)] leading-relaxed">
        <p>
          <strong className="text-[var(--paper)]">Trailmark</strong> is the
          public showcase for the Hult Cohort Developer Program Summer Pilot
          2026. Use it to browse participant evidence, open deploy URLs, and
          request intros without leaving the site.
        </p>
        <h3 className="font-display text-xl text-[var(--paper)]">Sample profiles</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/people/kiaracaesar5627" className="nav-link">
              /people/kiaracaesar5627
            </Link>
          </li>
          <li>
            <Link href="/people/demo-alex-rivera-01" className="nav-link">
              /people/demo-alex-rivera-01
            </Link>
          </li>
          <li>
            <Link href="/people/demo-priya-patel-04" className="nav-link">
              /people/demo-priya-patel-04
            </Link>
          </li>
        </ul>
        <h3 className="font-display text-xl text-[var(--paper)]">Key routes</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>/ — cohort narrative + featured people + PM snapshot</li>
          <li>/people — searchable directory</li>
          <li>/work — FlexiFlow status board</li>
          <li>/partners — fee model + hiring path</li>
          <li>/partners/intro — intro request form</li>
          <li>/rsvp — Aug 19 showcase registration</li>
        </ul>
        <h3 className="font-display text-xl text-[var(--paper)]">Fee summary</h3>
        <p>
          25% of first-year base salary on start · 90-day clawback · no
          exclusivity · 10% kickback to the hired graduate from collected fees.
        </p>
      </ScrollReveal>
    </section>
  );
}
