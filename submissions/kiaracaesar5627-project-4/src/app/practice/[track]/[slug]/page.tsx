import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getRound, JOB_TRACKS } from "@/lib/lessons";
import { InterviewRoundClient } from "@/components/LessonClient";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

type Props = { params: Promise<{ track: string; slug: string }> };

export function generateStaticParams() {
  return JOB_TRACKS.flatMap((t) =>
    t.scenarios.map((s) => ({ track: t.slug, slug: s.slug })),
  );
}

export default async function ScenarioPage({ params }: Props) {
  const { track, slug } = await params;
  const round = getRound(track, slug);
  if (!round) notFound();

  const jar = await cookies();
  const hasSession = Boolean(jar.get("pf_session")?.value);

  return (
    <>
      {hasSession ? <SessionHeartbeat /> : null}
      <InterviewRoundClient
        slug={round.slug}
        trackSlug={round.trackSlug}
        role={round.role}
        setting={round.setting}
        stage={round.stage}
        title={round.title}
        scenario={round.scenario}
        interviewer={round.interviewer}
        playbook={round.playbook}
        debrief={round.debrief}
        canTrack={hasSession}
      />
    </>
  );
}
