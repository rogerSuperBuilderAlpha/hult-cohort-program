"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProjectAction,
  deleteProjectAction,
  setProjectStatusAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/app/dashboard/projects/actions";
import { ProjectImageField } from "@/components/dashboard/ProjectImageField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TagInput } from "@/components/ui/TagInput";
import { Textarea } from "@/components/ui/Textarea";
import { NEEDS, PROJECT_STAGES, SECTORS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { Project } from "@/lib/types/project";

type Props = {
  userId: string;
  project?: Project;
};

export function ProjectForm({ userId, project }: Props) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project?.slug));
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [problem, setProblem] = useState(project?.problem ?? "");
  const [solution, setSolution] = useState(project?.solution ?? "");
  const [audience, setAudience] = useState(project?.target_audience ?? "");
  const [tech, setTech] = useState<string[]>(project?.technology_stack ?? []);
  const [stage, setStage] = useState(project?.stage ?? "idea");
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.github_url ?? "");
  const [demoUrl, setDemoUrl] = useState(project?.demo_url ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    project?.image_url ?? null,
  );
  const [needs, setNeeds] = useState<string[]>(project?.needs ?? []);
  const [sectors, setSectors] = useState<string[]>(project?.sectors ?? []);
  const [statusMessage, setStatusMessage] = useState<ProjectActionState>(null);
  const [publishPending, startPublishTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const boundUpdate = updateProjectAction.bind(null, project?.id ?? "");
  const actionFn = isEdit ? boundUpdate : createProjectAction;

  const [state, action, pending] = useActionState<ProjectActionState, FormData>(
    actionFn,
    null,
  );

  const flash =
    state?.success ||
    state?.error ||
    statusMessage?.success ||
    statusMessage?.error;
  const flashIsError = Boolean(state?.error || statusMessage?.error);
  const statusBusy = publishPending || deletePending || pending;

  function handlePublish() {
    if (!project) return;
    startPublishTransition(async () => {
      const result = await setProjectStatusAction(project.id, "published");
      setStatusMessage(result);
      if (result?.success) router.refresh();
    });
  }

  function handleUnpublish() {
    if (!project) return;
    startPublishTransition(async () => {
      const result = await setProjectStatusAction(project.id, "unpublished");
      setStatusMessage(result);
      if (result?.success) router.refresh();
    });
  }

  function handleDelete() {
    if (!project) return;
    const confirmed = window.confirm(
      "Delete this project? This cannot be undone.",
    );
    if (!confirmed) return;

    startDeleteTransition(async () => {
      // Isolated from publish — never shares publish's transition/action.
      const result = await deleteProjectAction(project.id);
      if (result?.error) setStatusMessage(result);
    });
  }

  return (
    <div className="space-y-8">
      {isEdit && project ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-foreground-muted">Status</p>
            <Badge
              tone={
                project.status === "published"
                  ? "accent"
                  : project.status === "unpublished"
                    ? "muted"
                    : "sky"
              }
            >
              {project.status}
            </Badge>
          </div>

          {/* Outside the save form — each control is type="button" with its own handler */}
          <div className="flex flex-wrap gap-2">
            {project.status === "published" ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={statusBusy}
                onClick={handleUnpublish}
              >
                {publishPending ? "Updating…" : "Unpublish"}
              </Button>
            ) : (
              <Button
                type="button"
                accent="projects"
                size="sm"
                disabled={statusBusy}
                onClick={handlePublish}
              >
                {publishPending ? "Publishing…" : "Publish project"}
              </Button>
            )}
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={statusBusy}
              onClick={handleDelete}
            >
              {deletePending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      ) : null}

      <form action={action} className="space-y-6">
        <ProjectImageField
          userId={userId}
          projectId={project?.id}
          value={imageUrl}
          onChange={setImageUrl}
          disabled={pending}
        />
        <input type="hidden" name="image_url" value={imageUrl ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Project name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={pending}
          />
          <Input
            label="Slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            hint="Used in the public URL: /projects/your-slug"
            required
            disabled={pending}
          />
        </div>

        <Input
          label="Tagline"
          name="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="One sharp line about what you’re building"
          hint="Max 200 characters. Required to publish."
          disabled={pending}
        />

        <Textarea
          label="Summary"
          name="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          hint="Max 500 characters. At least 40 required to publish."
          disabled={pending}
        />

        <Textarea
          label="Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          hint="Max 5000 characters."
          disabled={pending}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            label="Problem"
            name="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
            hint="Max 3000 characters. At least 20 required to publish."
            disabled={pending}
          />
          <Textarea
            label="Solution"
            name="solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            rows={4}
            hint="Max 3000 characters. At least 20 required to publish."
            disabled={pending}
          />
        </div>

        <Textarea
          label="Target audience"
          name="target_audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          rows={3}
          hint="Max 1000 characters."
          disabled={pending}
        />

        <TagInput
          label="Technology stack"
          name="technology_stack"
          value={tech}
          onChange={setTech}
          placeholder="e.g. Next.js, Supabase"
          hint="Each technology up to 80 characters."
          disabled={pending}
        />
        <input
          type="hidden"
          name="technology_stack"
          value={JSON.stringify(tech)}
        />

        <Select
          label="Stage"
          name="stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as typeof stage)}
          options={PROJECT_STAGES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          disabled={pending}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Live URL"
            name="live_url"
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://"
            disabled={pending}
          />
          <Input
            label="GitHub URL"
            name="github_url"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/…"
            disabled={pending}
          />
          <Input
            label="Demo URL"
            name="demo_url"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://"
            disabled={pending}
          />
        </div>

        <CheckboxGroup
          label="Sectors"
          name="sectors"
          options={SECTORS}
          value={sectors}
          onChange={setSectors}
          disabled={pending}
        />
        <input type="hidden" name="sectors" value={JSON.stringify(sectors)} />

        <CheckboxGroup
          label="What this project needs"
          name="needs"
          options={NEEDS}
          value={needs}
          onChange={setNeeds}
          disabled={pending}
          hint="Partners will see these on your public project page."
        />
        <input type="hidden" name="needs" value={JSON.stringify(needs)} />

        {flash ? (
          <p
            role="alert"
            className={[
              "rounded-md border px-3 py-2 text-sm",
              flashIsError
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-accent-projects/40 bg-accent-projects/10 text-accent-projects",
            ].join(" ")}
          >
            {flash}
          </p>
        ) : null}

        <Button type="submit" accent="projects" disabled={pending || statusBusy}>
          {pending
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save project"
              : "Create project"}
        </Button>
      </form>
    </div>
  );
}
