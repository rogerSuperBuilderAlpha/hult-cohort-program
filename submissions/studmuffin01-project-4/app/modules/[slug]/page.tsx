import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BaselinePromptExercise } from "@/components/BaselinePromptExercise";
import { CapstoneAssembleBox } from "@/components/CapstoneAssembleBox";
import { CompleteModuleButton } from "@/components/CompleteModuleButton";
import { LessonQuiz } from "@/components/LessonQuiz";
import { ModuleNav } from "@/components/ModuleNav";
import { TrackEvent } from "@/components/TrackEvent";
import { getLessonQuiz } from "@/content/lesson-quizzes";
import {
  capstoneBrief,
  getAdjacentModules,
  getModule,
  modules,
} from "@/content/course";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mod = getModule(slug);
  return { title: mod?.title ?? "Module" };
}

export default async function ModulePage({ params }: Props) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const { prev, next } = getAdjacentModules(slug);
  const isBaseline = slug === "cold-open";
  const isRetest = slug === "score-card";
  const isCapstone = slug === "capstone";
  const lessonQuiz = getLessonQuiz(slug);
  const number = String(mod.order + 1).padStart(2, "0");

  return (
    <article className="module-page">
      <TrackEvent
        event="lesson_started"
        metadata={{ module: mod.slug, kind: mod.kind }}
      />

      <p className="kicker">
        Module {number} · ~{mod.durationMinutes} min
      </p>
      <h1>{mod.title}</h1>
      <p className="muted">{mod.summary}</p>

      {isBaseline ? <BaselinePromptExercise phase="baseline" /> : null}

      {isRetest ? (
        <>
          <BaselinePromptExercise phase="retest" />
          <div className="panel">
            <h2>Your personal SCORE card</h2>
            <p className="muted">
              After the retest, jot habits you will actually use Monday morning:
            </p>
            <ul className="beats">
              <li>Default Role I should use most often</li>
              <li>Formats and tone constraints I need weekly</li>
              <li>Two things I must never let Copilot invent</li>
              <li>The weak prompt I will stop using</li>
            </ul>
          </div>
        </>
      ) : null}

      {!isBaseline && !isRetest ? (
        <>
          {mod.beats.length > 0 ? (
            <div className="panel">
              <h2 className="why-matters-heading">Why This Matters</h2>
              <ul className="beats">
                {mod.beats.map((beat) => (
                  <li key={beat}>{beat}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isCapstone ? (
            <div className="brief-box">
              <strong>{capstoneBrief.title}</strong>
              <p className="muted" style={{ margin: "0.5rem 0" }}>
                {capstoneBrief.learnerRole}
              </p>
              <p>
                <strong>Situation</strong>
              </p>
              <p style={{ margin: "0.35rem 0 0.75rem" }}>
                {capstoneBrief.situation}
              </p>
              <p>
                <strong>Recent information</strong>
              </p>
              <ul className="beats">
                {capstoneBrief.messyInput.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {lessonQuiz ? (
            <LessonQuiz quiz={lessonQuiz} />
          ) : (
            <>
              <div className="exercise">
                <strong>Exercise</strong>
                <p style={{ margin: "0.5rem 0 0" }}>{mod.exercise.prompt}</p>
                {mod.exercise.hint ? (
                  <p className="faint" style={{ marginTop: "0.5rem" }}>
                    Hint: {mod.exercise.hint}
                  </p>
                ) : null}
              </div>

              {mod.samples?.map((sample) => (
                <div className="sample" key={sample.label}>
                  <strong>{sample.label}</strong>
                  <pre>{sample.body}</pre>
                </div>
              ))}

              <p className="faint">
                <strong>Success check:</strong> {mod.successCheck}
              </p>
            </>
          )}

          {isCapstone ? <CapstoneAssembleBox /> : null}
        </>
      ) : null}

      <CompleteModuleButton moduleSlug={mod.slug} />

      <ModuleNav prev={prev} next={next} />
    </article>
  );
}
