import Link from "next/link";
import { notFound } from "next/navigation";
import { AmplificationEditor } from "@/components/dashboard/AmplificationEditor";
import { DraftAmplificationButton } from "@/components/dashboard/DraftAmplificationButton";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth/session";
import { builderPath, projectPath } from "@/lib/paths";
import { createClient } from "@/lib/supabase/server";
import type { Amplification } from "@/lib/types/amplification";

type Props = {
  params: Promise<{ campaignId: string }>;
};

export default async function AmplifyCampaignPage({ params }: Props) {
  const { campaignId } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      "id, creator_id, status, story_angle, why_angle_matters, core_message, evidence, call_to_action, project:projects!campaigns_project_id_fkey(id, name, slug, status, tagline), creator:profiles!campaigns_creator_id_fkey(id, name, avatar_url)",
    )
    .eq("id", campaignId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
        <Link
          href="/dashboard/amplify"
          className="text-sm text-accent hover:underline"
        >
          ← Back to Amplify
        </Link>
      </div>
    );
  }

  if (!campaign || campaign.creator_id === user.id) notFound();

  const project = campaign.project as unknown as {
    id: string;
    name: string;
    slug: string;
    status: string;
    tagline: string | null;
  } | null;
  const creator = campaign.creator as unknown as {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;

  if (!project || project.status !== "published") notFound();

  const { data: amplification } = await supabase
    .from("amplifications")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("participant_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const evidence = (campaign.evidence as string[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/dashboard/amplify"
          className="text-sm text-foreground-muted hover:text-accent"
        >
          ← Boost a Builder
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-accent-builders">
              {creator?.name || "Cohort builder"}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {project.name}
            </h1>
            {project.tagline ? (
              <p className="text-foreground-muted">{project.tagline}</p>
            ) : null}
          </div>
          <Badge tone="builders">approved campaign</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={projectPath(project.slug)}
            className="text-accent hover:underline"
          >
            Public project →
          </Link>
          {creator ? (
            <Link
              href={builderPath(creator.id)}
              className="text-accent hover:underline"
            >
              Builder profile →
            </Link>
          ) : null}
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-background-elevated p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
          Story angle
        </p>
        <h2 className="font-display text-2xl font-semibold leading-snug">
          {campaign.story_angle || "Untitled angle"}
        </h2>
        {campaign.why_angle_matters ? (
          <p className="max-w-3xl text-sm leading-relaxed text-foreground-muted">
            {campaign.why_angle_matters}
          </p>
        ) : null}
        {campaign.core_message ? (
          <p className="text-sm leading-relaxed">
            <span className="text-foreground-muted">Core message · </span>
            {campaign.core_message}
          </p>
        ) : null}
        {evidence.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Evidence you can reference
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {amplification ? (
        <div className="space-y-4">
          <AmplificationEditor
            amplification={amplification as Amplification}
          />
          {amplification.status === "draft" ? (
            <DraftAmplificationButton
              campaignId={campaignId}
              label="Regenerate draft"
              size="sm"
            />
          ) : null}
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">
            Draft your boost
          </h2>
          <p className="max-w-2xl text-sm text-foreground-muted">
            We’ll write a short endorsement in your voice from your profile and
            this campaign’s evidence. Edit anything before you share.
          </p>
          <DraftAmplificationButton campaignId={campaignId} />
        </section>
      )}
    </div>
  );
}
