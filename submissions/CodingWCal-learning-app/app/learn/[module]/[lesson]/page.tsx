import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";
import { getLesson, COURSE_MODULES, APP_NAME } from "@/lib/content";
import { Quiz } from "@/components/Quiz";
import { EventTracker } from "@/components/EventTracker";
import { LessonCompleteButton } from "@/components/CourseProgress";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return COURSE_MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ module: m.slug, lesson: l.slug }))
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const store = await cookies();
  const token = store.get("ai-onramp-session")?.value;
  const user = token ? await readSessionToken(token) : null;
  if (!user) redirect("/");

  const found = getLesson(moduleSlug, lessonSlug);
  if (!found) notFound();

  const { mod, lesson, index } = found;
  const moduleIndex = COURSE_MODULES.findIndex((m) => m.slug === mod.slug);
  const next =
    index + 1 < mod.lessons.length
      ? { module: mod.slug, lesson: mod.lessons[index + 1] }
      : moduleIndex + 1 < COURSE_MODULES.length
        ? { module: COURSE_MODULES[moduleIndex + 1].slug, lesson: COURSE_MODULES[moduleIndex + 1].lessons[0] }
        : null;

  return (
    <main className="flex-1 px-8 max-md:px-5 py-12">
      <EventTracker event="lesson_started" properties={{ lesson: lessonSlug, module: moduleSlug }} />
      <EventTracker event="session_heartbeat" properties={{ lesson: lessonSlug }} intervalMs={60000} />

      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/dashboard" className="hover:text-accent">
          {APP_NAME}
        </Link>
        <span>/</span>
        <span>{mod.title}</span>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </nav>

      <article className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          {mod.title} · Lesson {index + 1}
        </p>
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm text-muted mb-8">{lesson.minutes} min read</p>

        <div className="space-y-5 leading-relaxed text-[17px]">
          {lesson.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {lesson.code && (
            <pre className="rounded-xl border border-border bg-surface-2 p-5 text-sm overflow-x-auto">
              <code>{lesson.code}</code>
            </pre>
          )}
        </div>

        <Quiz lessonSlug={lessonSlug} moduleSlug={moduleSlug} quiz={lesson.quiz} />

        <LessonCompleteButton
          lessonSlug={lessonSlug}
          moduleSlug={moduleSlug}
          nextHref={
            next ? `/learn/${next.module}/${next.lesson.slug}` : "/dashboard"
          }
        />

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          {index > 0 ? (
            <Link
              href={`/learn/${mod.slug}/${mod.lessons[index - 1].slug}`}
              className="text-sm text-muted hover:text-accent"
            >
              ← Previous lesson
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${next.module}/${next.lesson.slug}`}
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-background transition hover:brightness-110"
            >
              Next lesson →
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-background transition hover:brightness-110"
            >
              Back to dashboard
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}