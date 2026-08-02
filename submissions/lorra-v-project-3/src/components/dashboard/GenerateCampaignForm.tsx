"use client";

import { useActionState, useMemo, useState } from "react";
import {
  generateCampaignAction,
  type CopilotActionState,
} from "@/app/dashboard/copilot/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

export type CopilotProjectOption = {
  id: string;
  name: string;
};

export type CopilotUpdateOption = {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
};

type Props = {
  projects: CopilotProjectOption[];
  updates: CopilotUpdateOption[];
  defaultProjectId?: string;
};

export function GenerateCampaignForm({
  projects,
  updates,
  defaultProjectId,
}: Props) {
  const [state, action, pending] = useActionState<
    CopilotActionState,
    FormData
  >(generateCampaignAction, null);

  const [projectId, setProjectId] = useState(
    defaultProjectId && projects.some((p) => p.id === defaultProjectId)
      ? defaultProjectId
      : (projects[0]?.id ?? ""),
  );

  const projectUpdates = useMemo(
    () => updates.filter((u) => u.project_id === projectId),
    [updates, projectId],
  );

  const updateOptions = useMemo(() => {
    const latest = projectUpdates[0];
    const opts = [
      {
        value: "none",
        label: latest
          ? `Latest update — ${latest.title}`
          : "No update (project fields only)",
      },
    ];
    for (const update of projectUpdates) {
      opts.push({
        value: update.id,
        label: `${update.title} · ${new Date(update.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
      });
    }
    return opts;
  }, [projectUpdates]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <form action={action} className="space-y-5">
      <Select
        label="Project"
        name="project_id"
        required
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        disabled={pending}
      />

      <Select
        label="Ground the story in"
        name="update_id"
        hint="Defaults to your latest update for that project."
        defaultValue="none"
        key={projectId}
        options={updateOptions}
        disabled={pending}
      />

      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      {pending ? (
        <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-background-elevated px-5 py-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 20% 40%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 55%), radial-gradient(ellipse at 80% 60%, color-mix(in oklab, var(--accent-partners) 25%, transparent), transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col items-start gap-3">
            <Spinner
              label="Finding your strongest story…"
              className="text-foreground"
            />
            <p className="max-w-md text-sm text-foreground-muted">
              Reading your project and update, shaping a credible angle, then
              drafting LinkedIn, X, Instagram, and partner copy.
            </p>
          </div>
        </div>
      ) : (
        <Button type="submit" accent="projects">
          Generate campaign
        </Button>
      )}
    </form>
  );
}
