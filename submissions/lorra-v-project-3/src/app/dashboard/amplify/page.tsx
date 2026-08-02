import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type BoostableCampaign = {
  id: string;
  story_angle: string | null;
  why_angle_matters: string | null;
  core_message: string | null;
  created_at: string;
  project: {
    id: string;
    name: string;
    slug: string;
    status: string;
    tagline: string | null;
  } | null;
  creator: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function AmplifyPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: campaigns, error }, { data: myBoosts }] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, story_angle, why_angle_matters, core_message, created_at, creator_id, project:projects!campaigns_project_id_fkey(id, name, slug, status, tagline), creator:profiles!campaigns_creator_id_fkey(id, name, avatar_url)",
      )
      .eq("status", "approved")
      .neq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("amplifications")
      .select("campaign_id, status")
      .eq("participant_id", user.id),
  ]);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Boost a Builder
        </h1>
        <p role="alert" className="text-sm text-danger">
          Couldn’t load campaigns: {error.message}
        </p>
      </div>
    );
  }

  const boostByCampaign = new Map(
    (myBoosts ?? []).map((b) => [b.campaign_id, b.status as string]),
  );

  const items = ((campaigns ?? []) as unknown as BoostableCampaign[]).filter(
    (c) => c.project?.status === "published",
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Boost a Builder
        </h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Amplify a peer’s approved campaign in your own voice. Draft with AI,
          edit until it sounds like you, then copy and mark it shared.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No campaigns to boost yet"
          description="When other builders approve campaign copy on a published project, they’ll show up here. Your own campaigns stay out of this list."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((campaign) => {
            const boostStatus = boostByCampaign.get(campaign.id);
            return (
              <li key={campaign.id}>
                <Link
                  href={`/dashboard/amplify/${campaign.id}`}
                  className="flex h-full flex-col gap-4 rounded-xl border border-border bg-background-elevated p-5 transition hover:border-accent-builders/50 hover:bg-background-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] text-accent-builders">
                        {campaign.creator?.name || "Cohort builder"}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold leading-snug">
                        {campaign.project?.name}
                      </h2>
                      {campaign.project?.tagline ? (
                        <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">
                          {campaign.project.tagline}
                        </p>
                      ) : null}
                    </div>
                    {boostStatus ? (
                      <Badge
                        tone={boostStatus === "shared" ? "builders" : "muted"}
                      >
                        {boostStatus}
                      </Badge>
                    ) : null}
                  </div>

                  {campaign.story_angle ? (
                    <div className="space-y-1 border-t border-border pt-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                        Story angle
                      </p>
                      <p className="line-clamp-3 text-sm leading-relaxed">
                        {campaign.story_angle}
                      </p>
                    </div>
                  ) : null}

                  <p className="mt-auto text-sm text-accent-builders">
                    {boostStatus === "shared"
                      ? "View your boost →"
                      : boostStatus === "draft"
                        ? "Continue draft →"
                        : "Boost this builder →"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
