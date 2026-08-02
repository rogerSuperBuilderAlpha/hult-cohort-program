import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectUpdateForm } from "@/components/dashboard/ProjectUpdateForm";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewProjectUpdatePage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, owner_id, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {error.message}
      </p>
    );
  }
  if (!data) notFound();

  const project = data as Pick<
    Project,
    "id" | "name" | "slug" | "owner_id" | "status"
  >;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/projects/${project.id}/updates`}
          className="text-sm text-foreground-muted transition hover:text-foreground"
        >
          ← Updates for {project.name}
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          New update
        </h1>
        <p className="mt-2 text-foreground-muted">
          Capture what moved — evidence first. This becomes fuel for the
          Campaign Copilot.
        </p>
      </div>
      <ProjectUpdateForm projectId={project.id} />
    </div>
  );
}
