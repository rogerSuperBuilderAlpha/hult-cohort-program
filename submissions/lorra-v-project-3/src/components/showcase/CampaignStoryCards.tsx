import type { ApprovedCampaignContent } from "@/lib/showcase";

const channelLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  partner_summary: "Partner summary",
};

type Props = {
  items: ApprovedCampaignContent[];
  title?: string;
};

export function CampaignStoryCards({
  items,
  title = "Campaign stories",
}: Props) {
  if (items.length === 0) return null;

  // Group by campaign story angle first
  const byCampaign = new Map<string, ApprovedCampaignContent[]>();
  for (const item of items) {
    const list = byCampaign.get(item.campaign.id) ?? [];
    list.push(item);
    byCampaign.set(item.campaign.id, list);
  }

  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-8">
        {[...byCampaign.entries()].map(([campaignId, rows]) => {
          const campaign = rows[0]!.campaign;
          return (
            <article
              key={campaignId}
              className="space-y-4 border-t border-border pt-6"
            >
              {campaign.story_angle ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-accent">
                    Story angle
                  </p>
                  <h3 className="font-display text-xl font-semibold">
                    {campaign.story_angle}
                  </h3>
                  {campaign.why_angle_matters ? (
                    <p className="max-w-3xl text-sm leading-relaxed text-foreground-muted">
                      {campaign.why_angle_matters}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-border bg-background-elevated p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                      {channelLabels[row.channel] ?? row.channel}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {row.content}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
