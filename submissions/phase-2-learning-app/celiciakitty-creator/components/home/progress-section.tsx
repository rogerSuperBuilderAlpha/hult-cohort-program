"use client";

import Link from "next/link";
import { BookOpen, Clock, Scale } from "lucide-react";
import Image from "next/image";

import { MotionHover, MotionWrapper } from "@/components/home/motion-wrapper";
import { LearningLevelCard } from "@/components/learn/learning-level-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContinueHref, getCourseSummary } from "@/lib/course/index";
import { COURSE_TITLE } from "@/lib/course/modules";
import { getLevelProgress } from "@/lib/progress/levels";
import { useProgress } from "@/hooks/use-progress";

export function ProgressSection() {
  const { progress, hydrated } = useProgress();
  const summary = hydrated
    ? getCourseSummary(progress)
    : {
        completed: 0,
        total: 5,
        timeRemaining: "~60 min remaining",
        currentModuleId: "1" as const,
        currentModuleTitle: "Contracts in Everyday Life",
        level: getLevelProgress(0, 5),
      };
  const continueHref = hydrated ? getContinueHref(progress) : "/learn/1";

  return (
    <MotionWrapper>
      <section aria-labelledby="progress-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2
            id="progress-heading"
            className="font-serif text-2xl font-semibold text-lex-navy"
          >
            Your Progress
          </h2>
          <Link
            href="/progress"
            className="text-sm font-medium text-lex-navy/60 transition-colors hover:text-lex-navy"
          >
            View all
          </Link>
        </div>

        <MotionHover>
          <Card className="overflow-hidden rounded-2xl border-lex-navy/10 bg-white py-0 shadow-[0_12px_40px_-16px_rgba(30,58,95,0.2)] ring-0">
            <CardHeader className="border-b border-lex-navy/8 bg-lex-pale/40 px-5 py-4">
              <CardTitle className="font-serif text-lg text-lex-navy">
                Continue where you left off
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <LearningLevelCard levelProgress={summary.level} compact />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-lex-navy/10 shadow-sm sm:size-28">
                  <Image
                    src="/images/floral-banner.png"
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover object-center"
                    aria-hidden
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-lex-navy/25">
                    <Scale className="size-10 text-white" strokeWidth={1.5} aria-hidden />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-xl font-semibold text-lex-navy">
                    {COURSE_TITLE}
                  </h3>
                  <p className="mt-1 text-sm text-lex-navy/65">
                    Current module: {summary.currentModuleTitle}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-4 text-sm text-lex-navy/70">
                    <li className="flex items-center gap-1.5">
                      <BookOpen className="size-4 text-lex-gold" aria-hidden />
                      {summary.completed} / {summary.total} Modules
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock className="size-4 text-lex-gold" aria-hidden />
                      {summary.timeRemaining}
                    </li>
                  </ul>
                  <Link
                    href={continueHref}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-lex-navy px-5 text-sm font-medium text-white hover:bg-lex-navy/90"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionHover>
      </section>
    </MotionWrapper>
  );
}
