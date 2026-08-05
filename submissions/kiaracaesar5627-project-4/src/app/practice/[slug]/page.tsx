import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getRound, ROUNDS } from "@/lib/lessons";
import { InterviewRoundClient } from "@/components/LessonClient";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ROUNDS.map((r) => ({ slug: r.slug }));
}

export default async function PracticeRoundPage({ params }: Props) {
  const { slug } = await params;
  const round = getRound(slug);
  if (!round) notFound();

  const jar = await cookies();
  const hasSession = Boolean(jar.get("pf_session")?.value);

  return (
    <>
      {hasSession ? <SessionHeartbeat /> : null}
      <InterviewRoundClient
        slug={round.slug}
        stage={round.stage}
        title={round.title}
        interviewer={round.interviewer}
        playbook={round.playbook}
        debrief={round.debrief}
        canTrack={hasSession}
      />
    </>
  );
}
