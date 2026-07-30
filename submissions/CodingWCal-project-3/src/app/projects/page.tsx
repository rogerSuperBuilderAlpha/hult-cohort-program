import { prisma } from "@/lib/prisma/db";
import { ProjectCard } from "@/components/ProjectCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Projects — Cursor Boston × Hult Showcase",
  description: "Browse all builds from the Cursor Boston × Hult cohort.",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: {
          member: {
            select: { id: true, name: true, avatar: true, slug: true },
          },
        },
      },
    },
  });

  return (
    <div className="px-8 max-md:px-5 pt-12">
      <div className="flex items-baseline justify-between pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
        <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight">
          All Projects
        </h1>
        <span className="text-sm text-vibe-muted">{projects.length}</span>
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-vibe-muted text-sm">
            No projects yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
