import {
  markWeeklyActive,
  submitContribution,
  submitPullRequest,
} from "@/app/actions/cohort";
import { Field, Panel, buttonClass, inputClass, secondaryButtonClass } from "@/components/ui";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Submit</h1>
        <p className="mt-2 text-[var(--muted)]">
          Log a PR or non-PR contribution. All fields are self-reported in v1.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
          {ok === "pr"
            ? "Pull request saved."
            : ok === "contribution"
              ? "Contribution logged."
              : "Marked active for this week."}
        </p>
      ) : null}

      <Panel>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          Pull request
        </h2>
        <form action={submitPullRequest} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="GitHub PR URL">
              <input
                className={inputClass}
                name="github_url"
                type="url"
                required
                placeholder="https://github.com/org/repo/pull/12"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Title">
              <input className={inputClass} name="title" required />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputClass} name="status" defaultValue="pending">
              <option value="pending">pending</option>
              <option value="merged">merged</option>
            </select>
          </Field>
          <Field label="Reviewer count">
            <input
              className={inputClass}
              name="reviewer_count"
              type="number"
              min={0}
              defaultValue={0}
            />
          </Field>
          <div className="sm:col-span-2">
            <button className={buttonClass} type="submit">
              Save PR
            </button>
          </div>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
          Contribution
        </h2>
        <form action={submitContribution} className="grid gap-4">
          <Field label="Type">
            <select className={inputClass} name="type" defaultValue="doc">
              <option value="doc">doc</option>
              <option value="design">design</option>
              <option value="pm_task">pm_task</option>
              <option value="issue_resolved">issue_resolved</option>
              <option value="feedback_addressed">feedback_addressed</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea className={inputClass} name="description" rows={3} required />
          </Field>
          <button className={buttonClass} type="submit">
            Log contribution
          </button>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-semibold">
          Weekly activity
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Mark yourself active for the current week (feeds weekly active %).
        </p>
        <form action={markWeeklyActive}>
          <button className={secondaryButtonClass} type="submit">
            I&apos;m active this week
          </button>
        </form>
      </Panel>
    </div>
  );
}
