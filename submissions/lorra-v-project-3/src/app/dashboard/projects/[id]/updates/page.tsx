import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteUpdateButton } from "@/components/dashboard/DeleteUpdateButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";
import type { ProjectUpdate } from "@/lib/types/project-update";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectUpdatesPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (projectError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {projectError.message}
      </p>
    );
  }
  if (!project) notFound();

  const typed = project as Project;

  const { data: updates, error: updatesError } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (updatesError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {updatesError.message}
      </p>
    );
  }

  const rows = (updates ?? []) as ProjectUpdate[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/projects/${typed.id}`}
            className="text-sm text-foreground-muted transition hover:text-foreground"
          >
            ← {typed.name}
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Progress updates
          </h1>
          <p className="mt-2 text-foreground-muted">
            Newest first. Published projects show these on the public timeline.
            {typed.status === "published" ? (
              <>
                {" "}
                <Link
                  href={`/projects/${typed.slug}`}
                  className="text-accent-projects hover:underline"
                >
                  View public page
                </Link>
              </>
            ) : (
              <span className="text-foreground-muted">
                {" "}
                Publish the project for the timeline to go live.
              </span>
            )}
          </p>
        </div>
        <Link href={`/dashboard/projects/${typed.id}/updates/new`}>
          <Button accent="projects">New update</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No updates yet"
          description="Log achievements, challenges, and evidence as you build — the Campaign Copilot will use these later."
          action={
            <Link href={`/dashboard/projects/${typed.id}/updates/new`}>
              <Button accent="projects">Write your first update</Button>
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {rows.map((update) => (
            <li
              key={update.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-foreground-muted">
                  {new Date(update.created_at).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <h2 className="font-display text-lg font-semibold">
                  {update.title}
                </h2>
                {update.description ? (
                  <p className="line-clamp-2 text-sm text-foreground-muted">
                    {update.description}
                  </p>
                ) : null}
              </div>
              <DeleteUpdateButton projectId={typed.id} updateId={update.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
