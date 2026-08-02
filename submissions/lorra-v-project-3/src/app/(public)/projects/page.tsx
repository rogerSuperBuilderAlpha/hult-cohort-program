import Link from "next/link";
import { NetworkBackdrop } from "@/components/showcase/NetworkBackdrop";
import { ProjectCard } from "@/components/showcase/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { listPublishedProjects } from "@/lib/showcase";

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = [];
  let errorMessage: string | null = null;

  try {
    projects = await listPublishedProjects();
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Could not load projects.";
  }

  return (
    <div className="relative overflow-hidden">
      <NetworkBackdrop
        tone="projects"
        className="opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-accent-projects">
            Directory
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
            Published work from the cohort — problems, solutions, and what each
            project needs next.
          </p>
        </div>

        {errorMessage ? (
          <p role="alert" className="mt-10 text-sm text-danger">
            {errorMessage}
          </p>
        ) : projects.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No projects published yet"
              description="Create and publish a project from your dashboard to land it in the showcase."
              action={
                <Link href="/dashboard/projects/new" className="inline-flex">
                  <Button accent="projects">Create a project</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
