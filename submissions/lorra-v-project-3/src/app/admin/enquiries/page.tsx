import Link from "next/link";
import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EnquiryStatus, PartnerEnquiry } from "@/lib/types/enquiry";
import { ENQUIRY_STATUS_LABELS } from "@/lib/types/enquiry";

type EnquiryRow = PartnerEnquiry & {
  project: { id: string; name: string } | null;
  participant: { id: string; name: string | null } | null;
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const FILTERS: { value: "all" | EnquiryStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

function parseStatusFilter(
  raw: string | undefined,
): "all" | EnquiryStatus {
  if (raw === "new" || raw === "in_progress" || raw === "closed") return raw;
  return "all";
}

function statusTone(
  status: EnquiryStatus,
): "coral" | "sky" | "muted" {
  if (status === "new") return "coral";
  if (status === "in_progress") return "sky";
  return "muted";
}

export default async function AdminEnquiriesPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter = parseStatusFilter(params.status);
  const admin = createAdminClient();

  let query = admin
    .from("partner_enquiries")
    .select(
      "*, project:projects!partner_enquiries_project_id_fkey(id, name), participant:profiles!partner_enquiries_participant_id_fkey(id, name)",
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Enquiries
        </h1>
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      </div>
    );
  }

  const enquiries = (data ?? []) as unknown as EnquiryRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Enquiries
        </h1>
        <p className="mt-2 text-foreground-muted">
          Partner interest submissions, newest first.
        </p>
      </div>

      <nav
        className="flex flex-wrap gap-2"
        aria-label="Filter enquiries by status"
      >
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? "/admin/enquiries"
              : `/admin/enquiries?status=${filter.value}`;
          const active = statusFilter === filter.value;
          return (
            <Link
              key={filter.value}
              href={href}
              className={[
                "rounded-md px-3 py-1.5 text-sm transition",
                active
                  ? "bg-accent-coral/15 text-accent-coral ring-1 ring-accent-coral/40"
                  : "text-foreground-muted hover:bg-background-muted hover:text-foreground",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {enquiries.length === 0 ? (
        <EmptyState
          title={
            statusFilter === "all"
              ? "No enquiries yet"
              : `No ${ENQUIRY_STATUS_LABELS[statusFilter].toLowerCase()} enquiries`
          }
          description={
            statusFilter === "all"
              ? "When someone submits the public partners form, they’ll show up here."
              : "Try another filter, or wait for new partner interest."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-background-muted text-xs uppercase tracking-[0.12em] text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">About</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-foreground-muted">
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="text-foreground hover:text-accent-coral"
                    >
                      {new Date(enquiry.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="font-medium hover:text-accent-coral"
                    >
                      {enquiry.organization}
                    </Link>
                    <p className="text-xs text-foreground-muted">
                      {enquiry.contact_name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="partners">{enquiry.interest_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {[
                      enquiry.project?.name,
                      enquiry.participant?.name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <Badge tone={statusTone(enquiry.status)}>
                        {ENQUIRY_STATUS_LABELS[enquiry.status]}
                      </Badge>
                      <EnquiryStatusSelect
                        enquiryId={enquiry.id}
                        status={enquiry.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
