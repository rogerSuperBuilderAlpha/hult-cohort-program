import Link from "next/link";
import { courseMeta, scoreLegend } from "@/content/course";

const HERO_IMAGE = {
  src: "/images/score-goal.png",
  alt: "A single football nestled in the back of the goal net, with the post and crossbar visible",
} as const;

export default function HomePage() {
  return (
    <>
      <section
        className="hero-stage"
        aria-label="Course introduction"
        style={{ ["--hero-image" as string]: `url(${HERO_IMAGE.src})` }}
      >
        <div
          className="hero-media"
          role="img"
          aria-label={HERO_IMAGE.alt}
        />
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-brand">SCORE</p>
          <h1>
            Prompt Like a Pro: The SCORE Method for Copilot
          </h1>
          <p className="hero-lede">
            Master the Art of Prompting. Unlock the Power of Copilot.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/modules">
              Open course
            </Link>
            <Link className="btn btn-ghost" href="/launch">
              Ludwitt launch
            </Link>
          </div>
          <p className="hero-meta">
            ~{courseMeta.runtimeMinutes} min · Professionals
          </p>
        </div>
      </section>

      <section className="score-band" aria-label="SCORE letters">
        <p className="score-band-lede">
          Transform the Way You Work with AI.
          <br />
          Learn how professionals use the SCORE framework to enable Copilot to
          deliver more accurate, relevant, and actionable responses.
        </p>
        <div className="score-row">
          {scoreLegend.map((item, index) => (
            <div
              key={item.letter}
              className="score-pill"
              style={{ animationDelay: `${0.08 * index}s` }}
            >
              <strong>{item.letter}</strong>
              <strong className="score-meaning">{item.name}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
