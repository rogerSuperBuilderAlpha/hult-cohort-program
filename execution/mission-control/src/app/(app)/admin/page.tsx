import { updateMvpStatus } from "@/app/actions/cohort";
import { loadCohortData } from "@/lib/data";
import { Field, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { mvp } = await loadCohortData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          MVP status
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Any authenticated member can edit this in v1 (no PM role). Feeds cohort level gates.
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
            />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="e2e_flow_implemented"
              defaultChecked={mvp?.e2e_flow_implemented ?? false}
              className="size-4 accent-[var(--accent)]"
            />
            <span>End-to-end flow implemented (Level 1 gate)</span>
          </label>
          <button className={buttonClass} type="submit">
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
