import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getLesson } from '@/lib/lessons';
import { readLearnerSession } from '@/lib/ludwitt';
import { LessonClient } from '@/components/LessonClient';

type Props = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: Props) {
  const session = await readLearnerSession();
  if (!session) redirect('/');

  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-leaf-700 underline">
        ← All lessons
      </Link>
      <article className="rounded-2xl border border-leaf-500/20 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">{lesson.title}</h2>
        <p className="mt-2 text-sm text-leaf-900/70">{lesson.summary}</p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-leaf-900/90">
          {lesson.body.map((paragraph) => (
            <li key={paragraph}>{paragraph}</li>
          ))}
        </ul>
        <LessonClient lessonId={lesson.id} quiz={lesson.quiz} />
      </article>
    </div>
  );
}
