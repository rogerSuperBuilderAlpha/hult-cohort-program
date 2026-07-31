import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma/db";
import { formatDate } from "@/lib/utils/formatDate";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Cursor Boston × Hult Showcase`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
              githubUrl: true,
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const techStack: string[] = JSON.parse(project.techStack);
  const images: string[] = JSON.parse(project.images);

  return (
    <div className="px-8 max-md:px-5 pb-12 animate-fade-in">
      <div
        className="w-full min-h-[280px] h-[45vh] rounded-[4px] mb-8 flex items-end p-8 text-white relative mt-6 overflow-hidden"
        style={
          project.coverImage
            ? {
                backgroundImage: `url(${project.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!project.coverImage && (
          <div className="absolute inset-0 bg-linear-to-br from-[#1e3a5f] to-vibe-surface-dark dark:to-[#242424]" />
        )}
        <div className="relative z-10">
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight mb-2">
            {project.title}
          </h1>
          {project.members.length > 0 && (
            <p className="text-sm opacity-80">
              by{" "}
              {project.members
                .map(({ member }) => member.name)
                .join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[720px] mx-auto">
        <div className="flex flex-wrap gap-4 mb-8">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-vibe-accent hover:underline"
            >
              Source Code →
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-vibe-accent hover:underline"
            >
              Live Demo →
            </a>
          )}
        </div>

        <p className="text-base leading-relaxed text-vibe-muted dark:text-[#b0b0b0] mb-6">
          {project.description}
        </p>

        <div className="flex gap-2 flex-wrap mb-8">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2.5 py-1 rounded-full bg-vibe-tag-bg text-vibe-tag-text font-mono font-medium dark:bg-vibe-tag-bg-dark dark:text-vibe-text-dark"
            >
              {tech}
            </span>
          ))}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {images.map((src, i) => (
              <div
                key={i}
                className="aspect-video bg-vibe-border dark:bg-vibe-border-dark rounded-[4px] flex items-center justify-center text-xs text-vibe-muted overflow-hidden"
              >
                {src.startsWith("http") ? (
                  <img
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>Screenshot {i + 1}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {project.members.length > 0 && (
          <div className="border-t border-vibe-border dark:border-vibe-border-dark pt-6 mt-8">
            <h2 className="text-sm font-semibold mb-3">Built by</h2>
            <div className="flex flex-wrap gap-4">
              {project.members.map(({ member }) => (
                <Link
                  key={member.id}
                  href={`/members/${member.slug}`}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-9 h-9 rounded-full bg-vibe-border dark:bg-vibe-border-dark flex items-center justify-center text-xs font-semibold text-vibe-muted flex-shrink-0">
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
                  <span className="text-sm font-medium group-hover:text-vibe-accent transition-colors">
                    {member.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-vibe-muted mt-6">
          Added {formatDate(project.createdAt)}
        </p>
      </div>
    </div>
  );
}
