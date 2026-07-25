import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "@/components/AdminBadge";
import { uploadRosterCsv } from "@/app/(app)/admin/roster/actions";

export default async function CohortPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, status")
    .eq("status", "active")
    .order("display_name", { ascending: true });

  const params = await searchParams;
  const okCount = typeof params.ok === "string" ? params.ok : null;
  const error = typeof params.error === "string" ? params.error : null;
  const isAdmin = me?.role === "admin";

  return (
    <section
      data-testid="cohort-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <p className="text-sm font-medium text-[var(--color-primary)]">Cohort</p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-dark)]">
        Member directory
      </h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Everyone who has signed up for Conexus. Signup is open self-serve — this
        directory is not an access allowlist.
      </p>

      <ul data-testid="cohort-member-list" className="mt-6 divide-y divide-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)]">
        {(members ?? []).map((m) => (
          <li
            key={m.id}
            data-testid="cohort-member"
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-dark)]">
                {(m.display_name || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-[var(--color-dark)]">
                    {m.display_name}
                  </span>
                  {m.role === "admin" ? <AdminBadge /> : null}
                </div>
                <p className="truncate text-xs text-[var(--color-secondary)]">
                  {m.email}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isAdmin ? (
        <div
          data-testid="roster-admin"
          className="mt-10 border-t border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] pt-8"
        >
          <h2 className="text-sm font-semibold text-[var(--color-dark)]">
            Optional CSV import
          </h2>
          <p className="mt-1 text-sm text-[var(--color-secondary)]">
            Facilitator-maintained list (<code>name, email</code>). Does not gate
            who can sign in.
          </p>
          {okCount ? (
            <p className="mt-3 text-sm text-[var(--color-primary)]" data-testid="roster-ok">
              Upserted {okCount} directory rows.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-[var(--color-danger)]" data-testid="roster-error">
              {error}
            </p>
          ) : null}
          <form action={uploadRosterCsv} className="mt-4 space-y-3">
            <input
              type="file"
              name="roster"
              accept=".csv,text/csv"
              required
              data-testid="roster-file"
              className="block w-full text-sm text-[var(--color-secondary)]"
            />
            <button
              type="submit"
              data-testid="roster-upload"
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Upload directory CSV
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
