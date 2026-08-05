import Link from "next/link";
import { cookies } from "next/headers";
import { ROUNDS } from "@/lib/lessons";
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
      <h2>Practice room</h2>
      <p className="support">
        {session
          ? "Your Ludwitt interview session is live. Pick a round and treat it like the real call."
          : "Browse rounds here. Counted practice requires launching from Ludwitt/Hult with a JWT."}
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
  );
}
