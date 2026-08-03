import type { Metadata } from "next";
import { InteractiveBoard } from "@/components/InteractiveBoard";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TrailMarquee } from "@/components/TrailMarquee";
import { getPmSnapshot } from "@/lib/pm";
import { pmUrl, commsUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Watch the Summer Pilot move — live project status and Phase 1 platform links.",
};

export default async function WorkPage() {
  const snapshot = await getPmSnapshot();

  return (
    <>
      <section className="section !pt-28 !pb-6">
        <PageHero
          kicker="In motion"
          title="Evidence you can open."
          lead="Real cohort status from FlexiFlow — not brochure copy. Deep-link the stack and filter the live board."
        >
          <div className="flex flex-wrap gap-3">
            <a
              href={pmUrl()}
              className="btn btn-primary btn-bounce"
              target="_blank"
              rel="noreferrer"
            >
              FlexiFlow (PM)
            </a>
            <a
              href={commsUrl()}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              Huddle (comms)
            </a>
          </div>
        </PageHero>
      </section>

      <TrailMarquee />

      <section className="section !pb-24">
        <ScrollReveal>
          <p className="section-kicker">Board</p>
          <h2>Live status</h2>
          <p className="section-lead">
            Search owners or filter by status — the board reacts instantly.
          </p>
        </ScrollReveal>
        <InteractiveBoard snapshot={snapshot} />
      </section>
    </>
  );
}
