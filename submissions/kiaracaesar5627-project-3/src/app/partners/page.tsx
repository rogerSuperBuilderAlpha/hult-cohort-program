import type { Metadata } from "next";
import Link from "next/link";
import { FeeCalculator } from "@/components/FeeCalculator";
import { HiringSteps } from "@/components/HiringSteps";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TrailMarquee } from "@/components/TrailMarquee";
import { TermCards } from "@/components/TermCards";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Hire from evidence — browse Summer Pilot trails, request intros, and RSVP for the Aug 19 showcase.",
};

export default function PartnersPage() {
  return (
    <>
      <section className="section !pt-28 !pb-8">
        <PageHero
          kicker="For hiring partners"
          title="Inspect the trail. Hire the proof."
          lead="Trailmark is the front door — not a deck. Browse builders, open deploys, request intros through placement."
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/partners/intro" className="btn btn-primary btn-bounce">
              Request intro
            </Link>
            <Link href="/rsvp" className="btn btn-ghost">
              Showcase RSVP
            </Link>
          </div>
        </PageHero>
      </section>

      <TrailMarquee />

      <section className="section">
        <ScrollReveal>
          <p className="section-kicker">Playbook</p>
          <h2>How hiring works</h2>
          <p className="section-lead">
            Hover or tap each step — the path from browse → hire, without the
            mystery.
          </p>
        </ScrollReveal>
        <HiringSteps />
      </section>

      <section className="section !pt-0">
        <ScrollReveal>
          <p className="section-kicker">Terms</p>
          <h2>Commercial at a glance</h2>
          <p className="section-lead">Tap a card to flip the fine print.</p>
        </ScrollReveal>
        <TermCards />
      </section>

      <section className="section !pt-0">
        <ScrollReveal>
          <p className="section-kicker">Fee math</p>
          <h2>Estimate the referral</h2>
          <p className="section-lead">
            Drag the salary slider — fee and graduate kickback update live.
          </p>
        </ScrollReveal>
        <FeeCalculator />
      </section>

      <section className="section !pt-0 !pb-24">
        <ScrollReveal>
          <div className="contact-panel">
            <h3 className="font-display text-2xl tracking-tight">Contact</h3>
            <p className="mt-3 max-w-2xl text-[var(--fog)] leading-relaxed">
              Placement lead monitors intro requests from this site. For pipeline
              questions before the Aug 19 showcase, use the intro form or RSVP and
              note your company in the message.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/partners/intro" className="btn btn-primary">
                Request intro
              </Link>
              <Link href="/rsvp" className="btn btn-ghost">
                Showcase RSVP
              </Link>
              <Link href="/partners/readme" className="btn btn-ghost">
                Partner README
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
