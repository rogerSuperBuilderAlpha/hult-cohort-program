import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuleLessonGate } from "@/components/learn/module-lesson-gate";
import { ModuleUnavailable } from "@/components/learn/module-unavailable";
import { PageShell } from "@/components/layout/page-shell";
import { getLesson } from "@/lib/course/index";
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
    title: meta ? `${meta.title} | LexLearn` : "Lesson | LexLearn",
  };
}

export function generateStaticParams() {
  return [{ moduleId: "1" }, { moduleId: "2" }, { moduleId: "3" }, { moduleId: "4" }, { moduleId: "5" }];
}

export default async function ModuleLessonPage({ params }: PageProps) {
  const { moduleId } = await params;

  if (!isValidModuleId(moduleId)) {
    notFound();
  }

  const lesson = getLesson(moduleId);

  return (
    <PageShell>
      {lesson ? (
        <ModuleLessonGate lesson={lesson} />
      ) : (
        <ModuleUnavailable moduleId={moduleId} />
      )}
    </PageShell>
  );
}
