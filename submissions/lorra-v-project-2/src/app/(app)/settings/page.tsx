import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "@/components/AdminBadge";
import { LinkedAccountsPanel } from "@/components/LinkedAccountsPanel";
import { PresenceDot } from "@/components/PresenceProvider";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const params = await searchParams;
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

  return (
    <div data-testid="settings-page" className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8">
        <p className="text-sm font-medium text-[var(--color-primary)]">Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-dark)]">
          Settings
        </h1>
        {params.linked === "1" ? (
          <p className="mt-3 text-sm text-[var(--color-primary)]">
            Sign-in method linked successfully.
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg)] text-lg font-semibold text-[var(--color-dark)]">
            {(profile?.display_name || "?").charAt(0).toUpperCase()}
            <PresenceDot
              userId={user.id}
              className="absolute bottom-0 right-0 ring-2 ring-[var(--color-surface)]"
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p
                data-testid="settings-display-name"
                className="truncate text-base font-semibold text-[var(--color-dark)]"
              >
                {profile?.display_name || "Member"}
              </p>
              {profile?.role === "admin" ? <AdminBadge /> : null}
            </div>
            <p className="truncate text-sm text-[var(--color-secondary)]">
              {profile?.email || user.email}
            </p>
          </div>
        </div>
      </section>

      <LinkedAccountsPanel />
    </div>
  );
}
