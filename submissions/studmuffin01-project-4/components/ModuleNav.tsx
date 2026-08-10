import Link from "next/link";
import type { CourseModule } from "@/content/course";

type Props = {
  prev?: CourseModule;
  next?: CourseModule;
};

export function ModuleNav({ prev, next }: Props) {
  return (
    <div className="module-nav">
      {prev ? (
        <Link href={`/modules/${prev.slug}`} className="nav-link">
          <span className="nav-link-label">Previous Module</span>
          <span className="nav-link-title">← {prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/modules/${next.slug}`}
          className="nav-link"
          style={{ textAlign: "right", marginLeft: "auto" }}
        >
          <span className="nav-link-label">Next Module</span>
          <span className="nav-link-title">{next.title} →</span>
        </Link>
      ) : (
        <Link
          href="/modules"
          className="nav-link"
          style={{ textAlign: "right", marginLeft: "auto" }}
        >
          <span className="nav-link-label">Course Modules</span>
          <span className="nav-link-title">Back to list →</span>
        </Link>
      )}
    </div>
  );
}
