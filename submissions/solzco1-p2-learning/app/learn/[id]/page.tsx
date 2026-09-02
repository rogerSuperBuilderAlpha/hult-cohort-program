import { notFound, redirect } from "next/navigation";
import { getLesson } from "@/lib/lessons";
import { getSession } from "@/lib/ludwitt/session";
import { LessonView } from "@/components/LessonView";

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const lesson = getLesson(params.id);
  if (!lesson) notFound();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <LessonView lesson={lesson} />
      </div>
    </main>
  );
}
