"use client";

import { useActionState } from "react";
import { createProject, updateProject } from "@/lib/actions/project";
import type { Project } from "@prisma/client";

interface Props {
  project?: Project & { members: { memberId: string }[] };
  members: { id: string; name: string }[];
}

export function ProjectForm({ project, members }: Props) {
  const [state, formAction, pending] = useActionState(
    project ? updateProject : createProject,
    null
  );

  return (
    <form action={formAction} className="max-w-[640px]">
      {project && (
        <input type="hidden" name="_slug" value={project.slug} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold mb-1.5"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={project?.title}
            required
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          {state?.error?.title && (
            <p className="text-xs text-red-500 mt-1">{state.error.title}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-semibold mb-1.5"
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={project?.slug}
            placeholder="auto-generated from title"
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          {state?.error?.slug && (
            <p className="text-xs text-red-500 mt-1">{state.error.slug}</p>
          )}
        </div>
      </div>

      <div className="mb-5">
        <label
          htmlFor="description"
          className="block text-sm font-semibold mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={project?.description}
          rows={4}
          className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors resize-vertical"
        />
        {state?.error?.description && (
          <p className="text-xs text-red-500 mt-1">
            {state.error.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label
            htmlFor="techStack"
            className="block text-sm font-semibold mb-1.5"
          >
            Tech Stack
          </label>
          <input
            id="techStack"
            name="techStack"
            type="text"
            defaultValue={
              project
                ? (() => {
                    try {
                      return JSON.parse(project.techStack).join(", ");
                    } catch {
                      return project.techStack;
                    }
                  })()
                : ""
            }
            placeholder="React, Node.js, Prisma"
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          <p className="text-xs text-vibe-muted mt-1">
            Comma-separated list
          </p>
          {state?.error?.techStack && (
            <p className="text-xs text-red-500 mt-1">
              {state.error.techStack}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="coverImage"
            className="block text-sm font-semibold mb-1.5"
          >
            Cover Image URL
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="url"
            defaultValue={project?.coverImage ?? ""}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          {state?.error?.coverImage && (
            <p className="text-xs text-red-500 mt-1">
              {state.error.coverImage}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label
            htmlFor="githubUrl"
            className="block text-sm font-semibold mb-1.5"
          >
            GitHub URL
          </label>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={project?.githubUrl ?? ""}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          {state?.error?.githubUrl && (
            <p className="text-xs text-red-500 mt-1">
              {state.error.githubUrl}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="liveUrl"
            className="block text-sm font-semibold mb-1.5"
          >
            Live URL
          </label>
          <input
            id="liveUrl"
            name="liveUrl"
            type="url"
            defaultValue={project?.liveUrl ?? ""}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark bg-vibe-surface dark:bg-vibe-surface-dark text-sm text-vibe-text dark:text-vibe-text-dark focus:outline-none focus:border-vibe-accent transition-colors"
          />
          {state?.error?.liveUrl && (
            <p className="text-xs text-red-500 mt-1">
              {state.error.liveUrl}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1.5">Members</label>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const checked = project?.members?.some(
              (pm) => pm.memberId === member.id
            );
            return (
              <label
                key={member.id}
                className="flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="memberIds"
                  value={member.id}
                  defaultChecked={checked}
                  className="accent-vibe-accent"
                />
                {member.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured ?? false}
            className="accent-vibe-accent"
          />
          <span className="font-semibold">Featured project</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-vibe-border dark:border-vibe-border-dark">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-[4px] bg-vibe-accent text-white text-sm font-semibold hover:bg-vibe-accent-hover transition-colors disabled:opacity-50"
        >
          {pending
            ? "Saving..."
            : project
              ? "Update Project"
              : "Create Project"}
        </button>
        <a
          href="/admin"
          className="px-5 py-2.5 rounded-[4px] border border-vibe-border dark:border-vibe-border-dark text-sm font-semibold text-vibe-muted hover:border-vibe-accent hover:text-vibe-accent transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
