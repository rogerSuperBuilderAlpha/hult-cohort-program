import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RsvpForm } from "@/components/RsvpForm";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ShowcaseAgenda } from "@/components/ShowcaseAgenda";
import { TrailMarquee } from "@/components/TrailMarquee";

export const metadata: Metadata = {
  title: "Showcase RSVP",
  description:
    "RSVP for the August 19, 2026 hiring partner showcase at Hult Boston (hybrid).",
};

export default function RsvpPage() {
  return (
    <>
      <section className="section !pt-28 !pb-6">
        <PageHero
          kicker="August 19, 2026"
          title="Hiring partner showcase."
          lead="Scrub the day agenda, pick in-person or virtual, then lock your RSVP. Hult Boston + livestream."
        />
      </section>
      <TrailMarquee />
      <section className="section !pt-10">
        <ScrollReveal>
          <p className="section-kicker">Agenda</p>
          <h2>Tap through the day</h2>
          <p className="section-lead">
            Hover or click each block — gallery, deep dives, lightning demos.
          </p>
        </ScrollReveal>
        <ShowcaseAgenda />
      </section>
      <section id="rsvp-form" className="section !pt-8 !pb-24">
        <ScrollReveal>
          <p className="section-kicker">Seat</p>
          <h2>Lock your RSVP</h2>
        </ScrollReveal>
        <div className="mt-6">
          <RsvpForm />
        </div>
      </section>
    </>
  );
}
