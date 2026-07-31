import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";

export default async function ProjectsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Projects
        </h1>
        <p role="alert" className="text-sm text-danger">
          Couldn’t load projects: {error.message}
        </p>
      </div>
    );
  }

  const projects = (data ?? []) as Project[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-2 text-foreground-muted">
            Create and publish the work you’ll amplify on Comentiq.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button accent="projects">New project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Start with one project — a clear problem, solution, and what you need next."
          action={
            <Link href="/dashboard/projects/new">
              <Button>Create your first project</Button>
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="flex flex-col gap-2 px-4 py-4 transition hover:bg-background-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-display text-lg font-semibold">
                    {project.name}
                  </p>
                  <p className="truncate text-sm text-foreground-muted">
                    {project.tagline || `/${project.slug}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="sky">{project.stage}</Badge>
                  <Badge
                    tone={
                      project.status === "published"
                        ? "accent"
                        : project.status === "unpublished"
                          ? "muted"
                          : "default"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
