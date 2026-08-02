import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignContentCard } from "@/components/dashboard/CampaignContentCard";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignContent,
  ContentChannel,
} from "@/lib/types/campaign";

const CHANNEL_ORDER: ContentChannel[] = [
  "linkedin",
  "x",
  "instagram",
  "partner_summary",
];

type Props = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: Props) {
  const { campaignId } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      "*, project:projects!campaigns_project_id_fkey(id, name, slug, status), campaign_content(*)",
    )
    .eq("id", campaignId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
        <Link href="/dashboard/copilot" className="text-sm text-accent hover:underline">
          ← Back to Copilot
        </Link>
      </div>
    );
  }

  if (!campaign) notFound();

  const row = campaign as Campaign & {
    project: {
      id: string;
      name: string;
      slug: string;
      status: string;
    } | null;
    campaign_content: CampaignContent[];
  };

  const contents = [...(row.campaign_content ?? [])].sort(
    (a, b) =>
      CHANNEL_ORDER.indexOf(a.channel) - CHANNEL_ORDER.indexOf(b.channel),
  );

  const approvedCount = contents.filter((c) => c.status === "approved").length;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/dashboard/copilot"
          className="text-sm text-foreground-muted hover:text-accent"
        >
          ← Campaign Copilot
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
              {row.project?.name ?? "Project"}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Review campaign
            </h1>
          </div>
          <Badge tone={row.status === "approved" ? "projects" : "muted"}>
            {row.status}
          </Badge>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-accent/25 bg-background-elevated p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Story angle
        </p>
        <h2 className="font-display text-2xl font-semibold leading-snug">
          {row.story_angle || "Untitled angle"}
        </h2>
        {row.why_angle_matters ? (
          <p className="max-w-3xl text-sm leading-relaxed text-foreground-muted">
            {row.why_angle_matters}
          </p>
        ) : null}

        <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          {row.core_message ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                Core message
              </dt>
              <dd className="mt-1 text-sm leading-relaxed">{row.core_message}</dd>
            </div>
          ) : null}
          {row.call_to_action ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                Call to action
              </dt>
              <dd className="mt-1 text-sm leading-relaxed">
                {row.call_to_action}
              </dd>
            </div>
          ) : null}
          {row.audience?.length ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                Audience
              </dt>
              <dd className="mt-1 text-sm leading-relaxed">
                {row.audience.join(" · ")}
              </dd>
            </div>
          ) : null}
          {row.evidence?.length ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                Evidence
              </dt>
              <dd className="mt-1 text-sm leading-relaxed">
                <ul className="list-disc space-y-1 pl-4">
                  {row.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="text-xs text-foreground-muted">
          Tracking code{" "}
          <code className="rounded bg-background-muted px-1.5 py-0.5">
            {row.tracking_code}
          </code>
          {approvedCount > 0 && row.project?.status === "published" ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/projects/${row.project.slug}`}
                className="text-accent hover:underline"
              >
                View on public project page
              </Link>
            </>
          ) : approvedCount > 0 ? (
            <> · Publish the project to show approved copy publicly</>
          ) : null}
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Channel variants
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Edit freely, then approve what you’ll use. Approving one or more
            variants marks the campaign approved and surfaces that copy on the
            public project page.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {contents.map((content) => (
            <CampaignContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>
    </div>
  );
}
