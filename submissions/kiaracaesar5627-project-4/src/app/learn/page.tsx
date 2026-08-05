import Link from "next/link";
import { cookies } from "next/headers";
import { LESSONS } from "@/lib/lessons";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";
import type { LearnerSession } from "@/app/api/session/route";

export default async function LearnIndexPage() {
  const jar = await cookies();
  const raw = jar.get("pf_session")?.value;
  let session: LearnerSession | null = null;
  if (raw) {
    try {
      session = JSON.parse(raw) as LearnerSession;
    } catch {
      session = null;
    }
  }

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: "2rem" }}>
      {session ? <SessionHeartbeat /> : null}
      <p className="eyebrow">{session ? `Signed in · ${session.email}` : "Preview mode"}</p>
      <h2>Lessons</h2>
      <p className="support">
        {session
          ? "Your Ludwitt session is active. Heartbeats fire every 60 seconds."
          : "You can read lessons here, but counted events require launching from Ludwitt/Hult with a JWT."}
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
  );
}
