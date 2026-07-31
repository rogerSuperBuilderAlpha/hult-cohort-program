import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";

export default async function DashboardPage() {
  const { profile, user } = await requireUser();
  const supabase = await createClient();
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { data: latest } = await supabase
    .from("projects")
    .select("id, name, status, slug")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  const projects = (latest ?? []) as Pick<
    Project,
    "id" | "name" | "status" | "slug"
  >[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Welcome{profile.name ? `, ${profile.name}` : ""}
        </h1>
        <p className="mt-2 text-foreground-muted">
          Complete your profile, publish a project, then bring the story to life
          with updates and campaigns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-background-elevated p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
            Profile
          </p>
          <p className="mt-2 font-display text-xl font-semibold capitalize">
            {profile.profile_status}
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Edit profile →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-background-elevated p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
            Projects
          </p>
          <p className="mt-2 font-display text-xl font-semibold">
            {count ?? 0}
          </p>
          <Link
            href="/dashboard/projects"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Manage projects →
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Create your first project"
          description="A published project unlocks updates, the Campaign Copilot, and partner interest."
          action={
            <Link href="/dashboard/projects/new">
              <Button>New project</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Recent projects</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-background-muted"
                >
                  <span className="font-medium">{project.name}</span>
                  <span className="text-foreground-muted">{project.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
