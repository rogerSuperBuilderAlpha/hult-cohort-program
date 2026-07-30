import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/db";
import { auth } from "@/lib/auth/config";
import { ProjectForm } from "@/app/admin/ProjectForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project — Admin — Cursor Boston × Hult Showcase",
};

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin");

  const editor = await prisma.editor.findFirst({
    where: { userId: session.user.id },
  });
  if (!editor) redirect("/admin");

  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        New Project
      </h1>
      <ProjectForm members={members} />
    </div>
  );
}
