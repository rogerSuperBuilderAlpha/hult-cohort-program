import Link from "next/link";
import { BuilderSpotlight } from "@/components/BuilderSpotlight";
import { CohortStory } from "@/components/CohortStory";
import { HeroInteractive } from "@/components/HeroInteractive";
import { PersonTile } from "@/components/PersonTile";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TrailMarquee } from "@/components/TrailMarquee";
import { VibeManifesto } from "@/components/VibeManifesto";
import { WorkPulse } from "@/components/WorkPulse";
import { PARTICIPANTS, publicParticipants } from "@/lib/participants";
import { getPmSnapshot } from "@/lib/pm";
import { SITE } from "@/lib/site";

export default async function HomePage() {
  const snapshot = await getPmSnapshot();
  const featured = publicParticipants().slice(0, 4);
  const spotlight = featured[0];
  const shipped = snapshot.projects.filter((p) => p.status === "shipped").length;

  return (
    <>
      <HeroInteractive />
      <TrailMarquee />

      <CohortStory />

      <section className="vibe-proof">
        <div className="vibe-proof-inner">
          <ScrollReveal className="vibe-proof-grid">
            <div>
              <p className="vibe-proof-num">{PARTICIPANTS.length}</p>
              <p className="vibe-proof-label">builders on the roster</p>
            </div>
            <div>
              <p className="vibe-proof-num">{publicParticipants().length}</p>
              <p className="vibe-proof-label">public profiles live now</p>
            </div>
            <div>
              <p className="vibe-proof-num">{shipped}</p>
              <p className="vibe-proof-label">projects marked shipped</p>
            </div>
            <div>
              <p className="vibe-proof-num">Aug 19</p>
              <p className="vibe-proof-label">hiring partner showcase</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <VibeManifesto />

      <section className="section">
        <ScrollReveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">The cohort</p>
              <h2>Faces behind the commits.</h2>
              <p className="section-lead">
                {SITE.support} Start with a spotlight, then open the full
                directory.
              </p>
            </div>
            <Link href="/people" className="btn btn-ghost">
              Full directory
            </Link>
          </div>
        </ScrollReveal>

        {spotlight ? (
          <div className="mb-6">
            <BuilderSpotlight person={spotlight} />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(1).map((person, i) => (
            <PersonTile key={person.handle} person={person} index={i + 1} />
          ))}
        </div>
      </section>

      <div className="divider" />

      <WorkPulse snapshot={snapshot} />

      <section className="vibe-cinema section !pb-24">
        <ScrollReveal>
          <p className="section-kicker">Partners</p>
          <h2 className="vibe-cinema-title">
            Ten minutes here.
            <br />
            A shortlist after.
          </h2>
          <p className="section-lead">
            Browse evidence. Request intros. RSVP for Boston. Referral fee is
            25% of first-year base on start — 90-day clawback, no exclusivity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/partners" className="btn btn-primary btn-bounce">
              Partner guide
            </Link>
            <Link href="/partners/intro" className="btn btn-ghost">
              Request intro
            </Link>
            <Link href="/rsvp" className="btn btn-ghost">
              Showcase RSVP
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
