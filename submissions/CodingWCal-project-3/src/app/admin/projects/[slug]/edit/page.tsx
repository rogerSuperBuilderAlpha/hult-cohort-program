import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/db";
import { auth } from "@/lib/auth/config";
import { ProjectForm } from "@/app/admin/ProjectForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Edit Project — Admin — Cursor Boston × Hult Showcase",
};

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/admin");

  const editor = await prisma.editor.findFirst({
    where: { userId: session.user.id },
  });
  if (!editor) redirect("/admin");

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      members: { select: { memberId: true } },
    },
  });
  if (!project) notFound();

  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Edit Project
      </h1>
      <ProjectForm project={project} members={members} />
    </div>
  );
}
