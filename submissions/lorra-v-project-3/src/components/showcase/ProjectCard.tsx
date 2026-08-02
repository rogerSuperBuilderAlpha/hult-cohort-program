import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { projectPath } from "@/lib/paths";
import type { PublicProject } from "@/lib/showcase";

type Props = {
  project: PublicProject;
  compact?: boolean;
};

export function ProjectCard({ project, compact = false }: Props) {
  const sectors = (project.sectors ?? []).slice(0, 3);
  const needs = (project.needs ?? []).slice(0, 2);

  return (
    <Link
      href={projectPath(project.slug)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-background-elevated transition hover:border-accent-projects/55 hover:shadow-[0_0_0_1px_rgba(61,255,181,0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-background-muted">
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image_url}
            alt={`${project.name} cover`}
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-end bg-[radial-gradient(ellipse_at_top_left,rgba(61,255,181,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(61,255,181,0.10),transparent_50%)] p-5">
            <span className="font-display text-2xl font-semibold text-foreground/90">
              {project.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-4" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="projects">{project.stage}</Badge>
          {sectors.map((sector) => (
            <Badge key={sector} tone="muted">
              {sector}
            </Badge>
          ))}
        </div>
        <div className="min-w-0 space-y-2">
          <h3
            className={`break-words font-display font-semibold tracking-tight transition group-hover:text-accent-projects ${
              compact ? "text-lg" : "text-xl"
            }`}
          >
            {project.name}
          </h3>
          {project.tagline ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-foreground-muted">
              {project.tagline}
            </p>
          ) : null}
        </div>
        {needs.length > 0 ? (
          <p className="mt-auto pt-2 text-xs text-foreground-muted">
            Needs: {needs.join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
