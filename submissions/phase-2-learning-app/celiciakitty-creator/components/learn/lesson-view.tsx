"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useEffect } from "react";

import { CategoryBadge } from "@/components/learn/category-badge";
import { CaseSpotlightCard } from "@/components/learn/case-spotlight";
import { KnowledgeCheck } from "@/components/learn/knowledge-check";
import { LessonSection } from "@/components/learn/lesson-section";
import { StatuteSpotlightCard } from "@/components/learn/statute-spotlight";
import { LegalDisclaimer } from "@/components/layout/legal-disclaimer";
import { getCaseSpotlight } from "@/lib/case-spotlights";
import { getModuleMeta } from "@/lib/course/index";
import type { LessonContent } from "@/lib/course/types";
import { getStatuteSpotlight } from "@/lib/statute-spotlights";
import { useProgress } from "@/hooks/use-progress";

type LessonViewProps = {
  lesson: LessonContent;
};

export function LessonView({ lesson }: LessonViewProps) {
  const { touchModule, completeLesson } = useProgress();
  const moduleMeta = getModuleMeta(lesson.moduleId);
  const caseSpotlight = lesson.caseSpotlightId
    ? getCaseSpotlight(lesson.caseSpotlightId)
    : undefined;
  const statuteSpotlight = lesson.statuteSpotlightId
    ? getStatuteSpotlight(lesson.statuteSpotlightId)
    : undefined;

  useEffect(() => {
    touchModule(lesson.moduleId, {});
  }, [lesson.moduleId, touchModule]);

  const handleContinue = () => {
    completeLesson(lesson.moduleId);
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
          Module {lesson.moduleId}
          {moduleMeta ? ` · ${moduleMeta.category}` : ""}
        </p>
        {moduleMeta && (
          <div className="mt-2">
            <CategoryBadge category={moduleMeta.category} />
          </div>
        )}
        <h1 className="mt-2 font-serif text-3xl font-semibold text-lex-navy sm:text-4xl">
          {lesson.title}
        </h1>
        <div className="mt-4">
          <LegalDisclaimer />
        </div>
      </header>

      <div className="space-y-6">
        <LessonSection title="Learning objective" id="objective">
          <p>{lesson.learningObjective}</p>
        </LessonSection>

        <LessonSection title="Why this matters" id="why">
          <p>{lesson.whyItMatters}</p>
        </LessonSection>

        <LessonSection title="Plain-language explanation" id="explanation">
          <p className="text-sm font-medium text-lex-navy">
            This lesson covers:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {lesson.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ol>
          {lesson.explanation.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </LessonSection>

        <LessonSection title={lesson.scenario.title} id="scenario">
          {lesson.scenario.narrative.map((line) => (
            <p key={line} className="rounded-lg bg-lex-pale/60 px-4 py-3 italic">
              {line}
            </p>
          ))}
          <div className="space-y-2 border-t border-lex-navy/10 pt-4">
            <p className="text-sm font-semibold text-lex-navy">
              {lesson.scenario.analysisHeading ??
                "What legal issues appear here?"}
            </p>
            {lesson.scenario.analysis.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </LessonSection>

        {caseSpotlight && (
          <LessonSection title="Case Spotlight" id="case-spotlight">
            <CaseSpotlightCard
              spotlight={caseSpotlight}
              showLearnMore={false}
            />
          </LessonSection>
        )}

        {statuteSpotlight && (
          <LessonSection title="Statute Spotlight" id="statute-spotlight">
            <StatuteSpotlightCard
              spotlight={statuteSpotlight}
              showLearnMore={false}
            />
          </LessonSection>
        )}

        <LessonSection title="Key legal terms" id="terms">
          <dl className="space-y-4">
            {lesson.keyTerms.map((term) => (
              <div
                key={term.term}
                className="rounded-lg border border-lex-navy/8 bg-lex-pale/30 px-4 py-3"
              >
                <dt className="font-semibold text-lex-navy">{term.term}</dt>
                <dd className="mt-1 text-sm">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </LessonSection>

        <LessonSection title="Quick knowledge check" id="check">
          <KnowledgeCheck question={lesson.knowledgeCheck} />
        </LessonSection>

        <LessonSection title="Key takeaways" id="takeaways">
          <ul className="list-disc space-y-2 pl-5">
            {lesson.takeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </LessonSection>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/quiz/${lesson.moduleId}`}
          onClick={handleContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lex-navy px-6 text-base font-medium text-white shadow-md hover:bg-lex-navy/90"
        >
          Continue to quiz
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href="/learn"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-lex-navy/20 bg-white px-6 text-base font-medium text-lex-navy shadow-sm hover:bg-lex-pale"
        >
          <BookOpen className="size-4" aria-hidden />
          Back to modules
        </Link>
      </div>
    </article>
  );
}
