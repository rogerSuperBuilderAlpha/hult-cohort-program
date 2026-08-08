import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuleQuizGate } from "@/components/learn/module-quiz-gate";
import { ModuleUnavailable } from "@/components/learn/module-unavailable";
import { PageShell } from "@/components/layout/page-shell";
import { getQuiz } from "@/lib/course/index";
import { getModuleMeta, isValidModuleId } from "@/lib/course/modules";

type PageProps = {
  params: Promise<{ moduleId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { moduleId } = await params;
  const meta = getModuleMeta(moduleId);
  return {
    title: meta ? `Quiz: ${meta.title} | LexLearn` : "Quiz | LexLearn",
  };
}

export function generateStaticParams() {
  return [{ moduleId: "1" }, { moduleId: "2" }, { moduleId: "3" }, { moduleId: "4" }, { moduleId: "5" }];
}

export default async function ModuleQuizPage({ params }: PageProps) {
  const { moduleId } = await params;

  if (!isValidModuleId(moduleId)) {
    notFound();
  }

  const quiz = getQuiz(moduleId);

  return (
    <PageShell>
      {quiz ? (
        <ModuleQuizGate quiz={quiz} />
      ) : (
        <ModuleUnavailable moduleId={moduleId} />
      )}
    </PageShell>
  );
}
