import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";
import { Badge } from "@/components/ui/Badge";
import { requireAdmin } from "@/lib/auth/session";
import { builderPath, projectPath } from "@/lib/paths";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EnquiryStatus, PartnerEnquiry } from "@/lib/types/enquiry";
import { ENQUIRY_STATUS_LABELS } from "@/lib/types/enquiry";

type Props = {
  params: Promise<{ id: string }>;
};

type EnquiryDetail = PartnerEnquiry & {
  project: { id: string; name: string; slug: string } | null;
  participant: { id: string; name: string | null; email: string } | null;
};

function statusTone(
  status: EnquiryStatus,
): "coral" | "sky" | "muted" {
  if (status === "new") return "coral";
  if (status === "in_progress") return "sky";
  return "muted";
}

export default async function AdminEnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("partner_enquiries")
    .select(
      "*, project:projects!partner_enquiries_project_id_fkey(id, name, slug), participant:profiles!partner_enquiries_participant_id_fkey(id, name, email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
        <Link
          href="/admin/enquiries"
          className="text-sm text-accent hover:underline"
        >
          ← Enquiries
        </Link>
      </div>
    );
  }

  if (!data) notFound();

  const enquiry = data as unknown as EnquiryDetail;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/enquiries"
          className="text-sm text-foreground-muted hover:text-accent-coral"
        >
          ← Enquiries
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {enquiry.organization}
            </h1>
            <p className="mt-2 text-foreground-muted">
              {new Date(enquiry.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <Badge tone={statusTone(enquiry.status)}>
            {ENQUIRY_STATUS_LABELS[enquiry.status]}
          </Badge>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-background-elevated p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Status</h2>
          <EnquiryStatusSelect
            enquiryId={enquiry.id}
            status={enquiry.status}
          />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Contact
            </dt>
            <dd className="mt-1 text-sm">
              {enquiry.contact_name}
              <br />
              <a
                href={`mailto:${enquiry.email}`}
                className="text-accent hover:underline"
              >
                {enquiry.email}
              </a>
            </dd>
          </div>
          {enquiry.website_url || enquiry.linkedin_url ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                Links
              </dt>
              <dd className="mt-1 space-y-1 text-sm">
                {enquiry.website_url ? (
                  <p>
                    <span className="text-foreground-muted">Website · </span>
                    <a
                      href={enquiry.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-accent hover:underline"
                    >
                      {enquiry.website_url}
                    </a>
                  </p>
                ) : null}
                {enquiry.linkedin_url ? (
                  <p>
                    <span className="text-foreground-muted">LinkedIn · </span>
                    <a
                      href={enquiry.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-accent hover:underline"
                    >
                      {enquiry.linkedin_url}
                    </a>
                  </p>
                ) : null}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Interest type
            </dt>
            <dd className="mt-1">
              <Badge tone="partners">{enquiry.interest_type}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Project
            </dt>
            <dd className="mt-1 text-sm">
              {enquiry.project ? (
                <Link
                  href={projectPath(enquiry.project.slug)}
                  className="text-accent hover:underline"
                >
                  {enquiry.project.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              Builder
            </dt>
            <dd className="mt-1 text-sm">
              {enquiry.participant ? (
                <Link
                  href={builderPath(enquiry.participant.id)}
                  className="text-accent hover:underline"
                >
                  {enquiry.participant.name || enquiry.participant.email}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
            Message
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {enquiry.message || "No message provided."}
          </p>
        </div>
      </section>
    </div>
  );
}
