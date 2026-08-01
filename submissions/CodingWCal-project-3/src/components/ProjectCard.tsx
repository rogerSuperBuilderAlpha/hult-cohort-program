import Link from "next/link";
import type { Project, Member } from "@prisma/client";

interface ProjectCardProps {
  project: Project & {
    members: { member: Pick<Member, "id" | "name" | "avatar" | "slug"> }[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const techStack: string[] = JSON.parse(project.techStack);
  const initials = project.title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const gradients = [
    "from-vibe-accent-light to-vibe-bg",
    "from-pink-100 to-vibe-bg",
    "from-emerald-100 to-vibe-bg",
    "from-amber-100 to-vibe-bg",
    "from-violet-100 to-vibe-bg",
  ];
  const gradient =
    gradients[
      project.title.length % gradients.length
    ];

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="group rounded-[4px] border border-vibe-border bg-vibe-surface dark:border-vibe-border-dark dark:bg-vibe-surface-dark overflow-hidden transition-colors duration-150 hover:border-vibe-accent cursor-pointer">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-[200px] object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className={`w-full h-[200px] bg-linear-to-br ${gradient} flex items-center justify-center`}
          >
            <span className="text-3xl font-bold text-vibe-accent opacity-60">
              {initials}
            </span>
          </div>
        )}

        <div className="p-5">
          {project.featured && (
            <p className="text-[0.6875rem] font-medium text-vibe-accent uppercase tracking-[0.08em] mb-2">
              Featured Project
            </p>
          )}
          <h3 className="text-lg font-semibold tracking-tight mb-1.5 leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-vibe-muted leading-relaxed mb-3 line-clamp-2">
            {project.description}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-vibe-tag-bg text-vibe-tag-text font-mono font-medium dark:bg-vibe-tag-bg-dark dark:text-vibe-text-dark"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {project.members.length > 0 && (
          <div className="px-5 pb-4 flex items-center gap-2.5">
            {project.members.slice(0, 3).map(({ member }) => (
              <div key={member.id} className="flex items-center gap-1.5">
                <div className="w-[26px] h-[26px] rounded-full bg-vibe-border dark:bg-vibe-border-dark flex items-center justify-center text-[0.6rem] font-semibold text-vibe-muted flex-shrink-0">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>
                <span className="text-xs font-medium">{member.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
