import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    buildersRes,
    publishedProjectsRes,
    campaignsRes,
    amplificationsRes,
    enquiriesRes,
    newEnquiriesRes,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    admin.from("campaigns").select("id", { count: "exact", head: true }),
    admin
      .from("amplifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "shared"),
    admin
      .from("partner_enquiries")
      .select("id", { count: "exact", head: true }),
    admin
      .from("partner_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const builders = buildersRes.count ?? 0;
  const publishedProjects = publishedProjectsRes.count ?? 0;
  const campaigns = campaignsRes.count ?? 0;
  const amplifications = amplificationsRes.count ?? 0;
  const enquiries = enquiriesRes.count ?? 0;
  const newEnquiries = newEnquiriesRes.count ?? 0;

  const statCards = [
    { label: "Builders", value: builders },
    { label: "Published projects", value: publishedProjects },
    { label: "Campaigns", value: campaigns },
    { label: "Shared amplifications", value: amplifications },
  ];

  const linkCards = [
    {
      label: "Partner enquiries",
      value: enquiries,
      href: "/admin/enquiries",
    },
    {
      label: "New enquiries",
      value: newEnquiries,
      href: "/admin/enquiries?status=new",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Admin overview
        </h1>
        <p className="mt-2 text-foreground-muted">
          Simple cohort counts — no charts, just the numbers that matter.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-background-elevated p-5"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {card.value}
            </p>
          </div>
        ))}
        {linkCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border bg-background-elevated p-5 transition hover:border-accent-coral/50"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
