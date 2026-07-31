import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        Couldn’t load project: {error.message}
      </p>
    );
  }
  if (!data) notFound();

  const project = data as Project;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dashboard/projects"
            className="text-sm text-foreground-muted transition hover:text-foreground"
          >
            ← All projects
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-2 text-foreground-muted">
            Edit details, cover image, and publish when ready.
            {project.status === "published" ? (
              <>
                {" "}
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-accent-projects hover:underline"
                >
                  View public page
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/projects/${project.id}/updates`}>
            <Button variant="secondary">Updates</Button>
          </Link>
          <Link href={`/dashboard/projects/${project.id}/updates/new`}>
            <Button accent="projects">New update</Button>
          </Link>
        </div>
      </div>
      <ProjectForm userId={user.id} project={project} />
    </div>
  );
}
