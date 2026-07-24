import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadRosterCsv } from "./actions";

export default async function RosterAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data: roster } = await supabase
    .from("roster_allowlist")
    .select("email, display_name, created_at")
    .order("display_name", { ascending: true });

  const params = await searchParams;
  const okCount = typeof params.ok === "string" ? params.ok : null;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <section
      data-testid="roster-admin"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Roster allowlist</h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Upload a CSV with columns <code>name, email</code>. Only allowlisted emails can complete
        Google or magic-link sign-in (PRD §2).
      </p>

      {okCount ? (
        <p className="mt-4 text-sm text-[var(--color-primary)]" data-testid="roster-ok">
          Upserted {okCount} roster rows.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-[var(--color-danger)]" data-testid="roster-error">
          {error}
        </p>
      ) : null}

      <form action={uploadRosterCsv} className="mt-6 space-y-3">
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
          Upload roster CSV
        </button>
      </form>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
        Current allowlist ({roster?.length ?? 0})
      </h2>
      <ul className="mt-3 divide-y divide-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)]">
        {(roster ?? []).map((row) => (
          <li key={row.email} className="flex justify-between gap-4 py-2 text-sm">
            <span className="font-medium text-[var(--color-dark)]">{row.display_name}</span>
            <span className="text-[var(--color-secondary)]">{row.email}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
