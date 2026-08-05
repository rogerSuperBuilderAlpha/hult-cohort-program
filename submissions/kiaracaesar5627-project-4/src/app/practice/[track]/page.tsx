import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTrack, JOB_TRACKS } from "@/lib/lessons";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

type Props = { params: Promise<{ track: string }> };

export function generateStaticParams() {
  return JOB_TRACKS.map((t) => ({ track: t.slug }));
}

export default async function TrackPage({ params }: Props) {
  const { track: trackSlug } = await params;
  const track = getTrack(trackSlug);
  if (!track) notFound();

  const jar = await cookies();
  const hasSession = Boolean(jar.get("pf_session")?.value);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: "2rem" }}>
      {hasSession ? <SessionHeartbeat /> : null}
      <p className="eyebrow">{track.setting}</p>
      <h2>{track.role}</h2>
      <p className="support">{track.blurb}</p>
      <div className="lesson-grid">
        {track.scenarios.map((s) => (
          <Link
            key={s.slug}
            href={`/practice/${track.slug}/${s.slug}`}
            className="lesson-link"
          >
            <p className="meta">
              {s.stage} · {s.minutes} min
            </p>
            <h3>{s.title}</h3>
            <p>{s.summary}</p>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: "1.75rem" }}>
        <Link href="/practice" className="text-link">
          All job tracks
        </Link>
      </p>
    </section>
  );
}
