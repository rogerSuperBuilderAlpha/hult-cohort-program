import Link from "next/link";
import { GenerateCampaignForm } from "@/components/dashboard/GenerateCampaignForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types/campaign";

type CampaignRow = Pick<
  Campaign,
  "id" | "name" | "status" | "story_angle" | "created_at" | "project_id"
> & {
  project: { id: string; name: string; slug: string } | null;
};

export default async function CopilotPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: projects, error: projectsError }, { data: updates }, { data: campaigns, error: campaignsError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("project_updates")
        .select("id, project_id, title, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select(
          "id, name, status, story_angle, created_at, project_id, project:projects!campaigns_project_id_fkey(id, name, slug)",
        )
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (projectsError) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Campaign Copilot
        </h1>
        <p role="alert" className="text-sm text-danger">
          Couldn’t load projects: {projectsError.message}
        </p>
      </div>
    );
  }

  const projectList = projects ?? [];
  const ownedIds = new Set(projectList.map((p) => p.id));
  const updateList = (updates ?? []).filter((u) =>
    ownedIds.has(u.project_id),
  );
  const campaignList = (campaigns ?? []) as unknown as CampaignRow[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Campaign Copilot
        </h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Turn a project update into a credible multi-channel story — LinkedIn,
          X, Instagram, and a partner summary — then approve what you’re proud
          to ship publicly.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-background-elevated p-6">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Generate a campaign
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Best results come from a published project with a concrete update.
          </p>
        </div>

        {projectList.length === 0 ? (
          <EmptyState
            title="Create a project first"
            description="The Copilot needs project context — problem, solution, and ideally a progress update."
            action={
              <Link href="/dashboard/projects/new">
                <Button>New project</Button>
              </Link>
            }
          />
        ) : (
          <GenerateCampaignForm
            projects={projectList}
            updates={updateList}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Your campaigns</h2>
        {campaignsError ? (
          <p role="alert" className="text-sm text-danger">
            {campaignsError.message}
          </p>
        ) : campaignList.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            No campaigns yet. Generate your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {campaignList.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={`/dashboard/copilot/${campaign.id}`}
                  className="flex flex-col gap-2 px-4 py-4 transition hover:bg-background-muted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-display text-lg font-semibold">
                      {campaign.story_angle || campaign.name}
                    </p>
                    <p className="truncate text-sm text-foreground-muted">
                      {campaign.project?.name ?? "Project"} ·{" "}
                      {new Date(campaign.created_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <Badge
                    tone={
                      campaign.status === "approved" ? "projects" : "muted"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
