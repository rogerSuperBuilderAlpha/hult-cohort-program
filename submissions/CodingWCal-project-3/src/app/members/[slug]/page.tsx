import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/db";
import { ProjectCard } from "@/components/ProjectCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await prisma.member.findUnique({ where: { slug } });
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} — Cursor Boston × Hult Showcase`,
    description: member.bio ?? undefined,
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { slug } = await params;
  const member = await prisma.member.findUnique({
    where: { slug },
    include: {
      projectMembers: {
        include: {
          project: {
            include: {
              members: {
                include: {
                  member: {
                    select: { id: true, name: true, avatar: true, slug: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!member) notFound();

  const projects = member.projectMembers.map((pm) => pm.project);

  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12 animate-fade-in">
      <div className="max-w-[720px] mx-auto text-center mb-10">
        <div className="w-[96px] h-[96px] rounded-full bg-vibe-border dark:bg-vibe-border-dark flex items-center justify-center text-2xl font-semibold text-vibe-muted mx-auto mb-4">
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
        <h1 className="text-xl font-semibold mb-1">{member.name}</h1>
        {member.status === "alumni" && (
          <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-vibe-alumni text-white font-medium inline-block mb-2">
            Alumni
          </span>
        )}
        {member.bio && (
          <p className="text-sm text-vibe-muted leading-relaxed max-w-md mx-auto">
            {member.bio}
          </p>
        )}

        <div className="flex gap-2 justify-center mt-4">
          {member.githubUrl && (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark flex items-center justify-center text-xs text-vibe-muted hover:border-vibe-accent hover:text-vibe-accent transition-colors"
            >
              GH
            </a>
          )}
          {member.twitterUrl && (
            <a
              href={member.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark flex items-center justify-center text-xs text-vibe-muted hover:border-vibe-accent hover:text-vibe-accent transition-colors"
            >
              X
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark flex items-center justify-center text-xs text-vibe-muted hover:border-vibe-accent hover:text-vibe-accent transition-colors"
            >
              Li
            </a>
          )}
          {member.websiteUrl && (
            <a
              href={member.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark flex items-center justify-center text-xs text-vibe-muted hover:border-vibe-accent hover:text-vibe-accent transition-colors"
            >
              Web
            </a>
          )}
        </div>
      </div>

      {projects.length > 0 ? (
        <>
          <div className="flex items-baseline justify-between pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
            <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
            <span className="text-sm text-vibe-muted">{projects.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project as typeof project & { members: { member: { id: string; name: string; avatar: string | null; slug: string } }[] }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-vibe-muted">No projects yet.</p>
        </div>
      )}
    </div>
  );
}
