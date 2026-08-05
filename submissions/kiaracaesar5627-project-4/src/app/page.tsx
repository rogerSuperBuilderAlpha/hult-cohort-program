import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { SITE } from "@/lib/site";
import { SEEDED_APP } from "@/lib/platform/store";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>{SITE.name}</h1>
          <p className="lede">{SITE.tagline}</p>
          <div className="cta-row">
            <Link href="/learn" className="btn primary">
              Browse lessons
            </Link>
            <a className="btn" href="#how">
              How launch works
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="lessons">
        <h2>Four patterns. One week of drills.</h2>
        <p className="support">
          Built for coding interviews: short lessons, a check question each, and
          platform events so Ludwitt can see the session.
        </p>
        <div className="lesson-grid">
          {LESSONS.map((lesson) => (
            <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="lesson-link">
              <p className="meta">{lesson.minutes} min</p>
              <h3>{lesson.title}</h3>
              <p>{lesson.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <h2>Ludwitt launch + events</h2>
        <p className="support">
          Counted sessions start at <code>/launch?token=…</code> with a platform JWT.
          App ID <code>{SEEDED_APP.app_id}</code>. Events:{" "}
          <code>lesson_started</code>, <code>lesson_completed</code>,{" "}
          <code>quiz_submitted</code>, <code>session_heartbeat</code>.
        </p>
      </section>
    </>
  );
}
