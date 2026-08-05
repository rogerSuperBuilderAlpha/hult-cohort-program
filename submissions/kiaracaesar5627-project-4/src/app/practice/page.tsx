import Link from "next/link";
import { cookies } from "next/headers";
import { JOB_TRACKS } from "@/lib/lessons";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";
import type { LearnerSession } from "@/app/api/session/route";

export default async function PracticeIndexPage() {
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
      <p className="eyebrow">
        {session ? `Candidate session · ${session.email}` : "Preview · not counted"}
      </p>
      <h2>Job application tracks</h2>
      <p className="support">
        Pick the role you’re interviewing for. Each track has scenarios tailored to
        that application — behavioral, technical, case, and closing-style prompts.
      </p>
      <div className="lesson-grid">
        {JOB_TRACKS.map((track) => (
          <Link key={track.slug} href={`/practice/${track.slug}`} className="lesson-link">
            <p className="meta">
              {track.setting} · {track.scenarios.length} questions
            </p>
            <h3>{track.role}</h3>
            <p>{track.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
