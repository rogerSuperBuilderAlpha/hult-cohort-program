import Link from "next/link";
import { SITE } from "@/lib/site";

/** Long-form partner narrative — keeps the ≥200 word homepage requirement. */
export function CohortStory() {
  return (
    <section className="cohort-story section">
      <p className="section-kicker">The story</p>
      <h2 className="cohort-story-title">
        A cohort you can
        <span className="vibe-accent"> audit.</span>
      </h2>
      <div className="cohort-story-grid">
        <div className="cohort-story-col">
          <p>
            The {SITE.cohort} {SITE.term} is not a hackathon highlight reel and
            it is not a résumé factory. Over six compressed weeks, enrolled
            builders ship production systems the cohort itself depends on —
            project management, internal communications, and this public
            marketing surface — then defend that work under written peer review
            and private votes. The trail is deliberate: repositories, pull
            requests, deploy URLs, operator handoffs. If it did not run in
            production, it does not count.
          </p>
          <p>
            Trailmark exists so hiring partners can spend a focused ten minutes
            and leave with a shortlist grounded in evidence. Every public
            profile links GitHub contributions, contest submissions, and live
            deploys when they exist. Cohort project status is mirrored from the
            project management platform so the marketing site stays wired to
            real work — not a brochure frozen the week before demo day.
          </p>
        </div>
        <div className="cohort-story-col">
          <p>
            Partners evaluate people the way serious engineering orgs already
            do: by reading commits, reviews, and production behavior. Fee terms
            stay simple — you pay on hire. Students opt into public profiles by
            default and can go private without leaving the roster. Request an
            intro and placement routes the conversation; RSVP for the August 19
            showcase and meet the cohort in Boston or on the livestream.
          </p>
          <p>
            {SITE.pitch} The winning showcase becomes the cohort&apos;s public
            face for the rest of the pilot. Trailmark is built for that job:
            cinematic enough to feel alive, rigorous enough to trust, fast on
            mobile, and honest about what has shipped versus what is still in
            motion. Browse the builders. Open the deploys. Follow the heat.
          </p>
          <div className="cohort-story-cta">
            <Link href="/people" className="btn btn-primary">
              Browse builders
            </Link>
            <Link href="/work" className="btn btn-ghost">
              Live work board
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
