import type { Metadata } from "next";
import { ModuleList } from "@/components/ModuleList";
import { ResetCourseProgress } from "@/components/ResetCourseProgress";
import { courseMeta } from "@/content/course";

export const metadata: Metadata = {
  title: "Course Modules",
};

export default function ModulesPage() {
  return (
    <section>
      <div className="modules-intro">
        <h1>Course Modules</h1>
        <p className="muted">
          Complete the modules in order (approx. {courseMeta.runtimeMinutes}{" "}
          minutes).
          <br />
          Learn each element of SCORE, then apply the full framework to a
          realistic workplace challenge.
        </p>
      </div>
      <ModuleList />
      <ResetCourseProgress />
    </section>
  );
}
