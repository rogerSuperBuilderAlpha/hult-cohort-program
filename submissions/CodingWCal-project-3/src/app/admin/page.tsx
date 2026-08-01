import Link from "next/link";
import { prisma } from "@/lib/prisma/db";
import { auth } from "@/lib/auth/config";
import { formatDate } from "@/lib/utils/formatDate";
import { DeleteButton } from "./DeleteButton";
import { SignInButton } from "./SignInButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Cursor Boston × Hult Showcase",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="px-8 max-md:px-5 pt-12 pb-12 max-w-[480px] mx-auto text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-3">Admin</h1>
        <p className="text-sm text-vibe-muted mb-6">
          Sign in with GitHub to manage projects.
        </p>
        <SignInButton />
      </div>
    );
  }

  const editor = await prisma.editor.findFirst({
    where: { userId: session.user.id },
  });

  if (!editor) {
    return (
      <div className="px-8 max-md:px-5 pt-12 pb-12 max-w-[480px] mx-auto text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          Not an editor
        </h1>
        <p className="text-sm text-vibe-muted mb-6">
          You don&apos;t have editor access. Contact the cohort lead.
        </p>
        <Link
          href="/api/auth/signout"
          className="text-sm text-vibe-accent hover:underline"
        >
          Sign out
        </Link>
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <div className="flex items-center justify-between pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 rounded-[4px] bg-vibe-accent text-white text-sm font-semibold hover:bg-vibe-accent-hover transition-colors"
        >
          New Project
        </Link>
      </div>

      <p className="text-xs text-vibe-muted mb-4">
        Signed in as {session.user.name} ({editor.role})
      </p>

      {projects.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-vibe-muted">No projects yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-border dark:border-vibe-border-dark text-left text-xs text-vibe-muted uppercase tracking-wider">
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Featured</th>
                <th className="pb-2 pr-4 font-medium">Created</th>
                <th className="pb-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-vibe-border/50 dark:border-vibe-border-dark/50"
                >
                  <td className="py-3 pr-4 font-medium">{project.title}</td>
                  <td className="py-3 pr-4">
                    {project.featured ? (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-vibe-accent-light text-vibe-accent font-medium dark:bg-[#1e3a5f]">
                        Featured
                      </span>
                    ) : (
                      <span className="text-xs text-vibe-muted">No</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-vibe-muted text-xs">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="text-xs text-vibe-accent hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton slug={project.slug} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-vibe-border dark:border-vibe-border-dark">
        <Link
          href="/api/auth/signout"
          className="text-xs text-vibe-muted hover:text-vibe-accent transition-colors"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
