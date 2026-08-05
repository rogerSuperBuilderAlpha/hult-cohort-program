import Link from "next/link";
import { ROUNDS } from "@/lib/lessons";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>{SITE.name}</h1>
          <p className="lede">{SITE.tagline}</p>
          <div className="cta-row">
            <Link href="/practice" className="btn primary">
              Enter practice room
            </Link>
            <a className="btn" href="#rounds">
              See rounds
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="rounds">
        <h2>Four rounds. One full loop.</h2>
        <p className="support">
          Behavioral, coding screen, system design, and closing questions — run
          each like a real interview, then debrief.
        </p>
        <div className="lesson-grid">
          {ROUNDS.map((round) => (
            <Link key={round.slug} href={`/practice/${round.slug}`} className="lesson-link">
              <p className="meta">
                {round.stage} · {round.minutes} min
              </p>
              <h3>{round.title}</h3>
              <p>{round.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>How a session starts</h2>
        <p className="support">
          Launch from Ludwitt/Hult with a signed JWT at <code>/launch</code>. That
          opens a counted interview session — rounds fire learning events the
          platform can see.
        </p>
      </section>
    </>
  );
}
