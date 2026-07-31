import { prisma } from "@/lib/prisma/db";
import { ProjectCard } from "@/components/ProjectCard";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { featured: true },
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
    <>
      <section className="px-8 max-md:px-5 pt-[clamp(3rem,6vw,6rem)] pb-[clamp(2rem,3vw,3rem)] max-w-[720px]">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-vibe-accent mb-4">
          Cursor Boston × Hult 2026
        </p>
        <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[1.1] tracking-[-0.03em] mb-5">
          The Vibe Showcase
        </h1>
        <p className="text-lg text-vibe-muted max-w-[560px] leading-relaxed">
          Curated editorial showcase of the best weekly builds from the Cursor
          Boston × Hult cohort. Warm design, clean typography, zero cruft.
        </p>
      </section>

      <div className="px-8 max-md:px-5">
        <div className="flex items-baseline justify-between py-8 pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
          <h2 className="text-[clamp(1.25rem,2.5vw,2rem)] font-semibold tracking-tight">
            Featured Projects
          </h2>
          <span className="text-sm text-vibe-muted">{projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-vibe-muted text-sm">
              No featured projects yet. Check back soon.
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
    </>
  );
}
