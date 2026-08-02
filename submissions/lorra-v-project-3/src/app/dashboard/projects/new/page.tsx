import Link from "next/link";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { requireUser } from "@/lib/auth/session";

export default async function NewProjectPage() {
  const { user } = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="text-sm text-foreground-muted transition hover:text-foreground"
        >
          ← All projects
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          New project
        </h1>
        <p className="mt-2 text-foreground-muted">
          Draft first — publish when the story is clear enough for partners.
        </p>
      </div>
      <ProjectForm userId={user.id} />
    </div>
  );
}
