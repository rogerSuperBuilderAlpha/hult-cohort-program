import Link from "next/link";
import { JOB_TRACKS } from "@/lib/lessons";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>{SITE.name}</h1>
          <p className="lede">{SITE.tagline}</p>
          <div className="cta-row">
            <Link href="/coach" className="btn primary">
              Personalize with coach
            </Link>
            <Link href="/practice" className="btn">
              Browse job tracks
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="tracks">
        <h2>Questions by job application</h2>
        <p className="support">
          Each track is a different role and hiring context — with scenario-specific
          interviewer prompts, not generic one-size questions.
        </p>
        <div className="lesson-grid">
          {JOB_TRACKS.map((track) => (
            <Link key={track.slug} href={`/practice/${track.slug}`} className="lesson-link">
              <p className="meta">
                {track.setting} · {track.scenarios.length} scenarios
              </p>
              <h3>{track.role}</h3>
              <p>{track.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>AI interview coach</h2>
        <p className="support">
          Not sure where to start? The{" "}
          <Link href="/coach" className="text-link">
            coach chat
          </Link>{" "}
          asks about your target role and maps you to specific scenarios — plus
          mock prompts and STAR feedback. Works with a built-in personalizer; add
          an API key for full LLM replies.
        </p>
      </section>

      <section className="section">
        <h2>How a session starts</h2>
        <p className="support">
          Launch from Ludwitt/Hult with a signed JWT at <code>/launch</code>. That
          opens a counted interview session — each question fires learning events
          the platform can see.
        </p>
      </section>
    </>
  );
}
