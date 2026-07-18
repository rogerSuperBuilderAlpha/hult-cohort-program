import Link from "next/link";
import { updateMvpStatus } from "@/app/actions/cohort";
import { getCurrentProfile, loadCohortData } from "@/lib/data";
import { Field, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const me = await getCurrentProfile();
  const { mvp, projects } = await loadCohortData();
  const canEdit =
    !!me &&
    projects.some((p) => p.owner_id === me.id && p.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          MVP status
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Writes restricted to members who own at least one active project (no
          separate PM role). Feeds cohort level gates.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
          MVP status updated.
        </p>
      ) : null}
      {!canEdit ? (
        <p className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--muted)]">
          Create an active project on{" "}
          <Link href="/projects" className="text-[var(--accent)] hover:underline">
            Projects
          </Link>{" "}
          before editing MVP status.
        </p>
      ) : null}

      <Panel>
        <form action={updateMvpStatus} className="grid max-w-lg gap-4">
          <Field label="Feature completion %">
            <input
              className={inputClass}
              name="feature_completion_pct"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={Number(mvp?.feature_completion_pct ?? 0)}
              required
              disabled={!canEdit}
            />
          </Field>
          <Field label="Critical bugs open">
            <input
              className={inputClass}
              name="critical_bugs_open"
              type="number"
              min={0}
              step={1}
              defaultValue={mvp?.critical_bugs_open ?? 0}
              required
              disabled={!canEdit}
            />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="e2e_flow_implemented"
              defaultChecked={mvp?.e2e_flow_implemented ?? false}
              className="size-4 accent-[var(--accent)]"
              disabled={!canEdit}
            />
            <span>End-to-end flow implemented (Level 1 gate)</span>
          </label>
          <button className={buttonClass} type="submit" disabled={!canEdit}>
            Save MVP status
          </button>
        </form>
        {mvp?.updated_at ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Last updated {new Date(mvp.updated_at).toLocaleString()}
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
