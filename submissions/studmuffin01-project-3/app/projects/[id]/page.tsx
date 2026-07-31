import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectDetail } from "@/components/ProjectDetail";
import { allProjectIds, getProject } from "@/lib/projects";
import { siteUrl } from "@/lib/links";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allProjectIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return { title: "Project" };
  return {
    title: project.name,
    description: project.tagline,
    openGraph: {
      title: `${project.name} · Lighthouse`,
      description: project.tagline,
      url: siteUrl(`/projects/${project.id}`),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ProjectDetail project={project} />
      </main>
      <SiteFooter />
    </div>
  );
}
