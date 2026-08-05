import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getLesson, LESSONS } from "@/lib/lessons";
import { LessonClient } from "@/components/LessonClient";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const jar = await cookies();
  const hasSession = Boolean(jar.get("pf_session")?.value);

  return (
    <>
      {hasSession ? <SessionHeartbeat /> : null}
      <LessonClient
        slug={lesson.slug}
        title={lesson.title}
        body={lesson.body}
        quiz={lesson.quiz}
        canTrack={hasSession}
      />
    </>
  );
}
