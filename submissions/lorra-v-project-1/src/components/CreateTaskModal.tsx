"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/tasks";
import { Modal } from "@/components/Modal";
import { Field, buttonClass, inputClass } from "@/components/ui";
import type { Profile, Project } from "@/lib/types";

export function CreateTaskModal({
  profiles,
  activeProjects,
  meId,
  filters,
}: {
  profiles: Profile[];
  activeProjects: Project[];
  meId: string;
  filters: { project: string; assignee: string; status: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        Create Task
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create task">
        <form action={createTask} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="project" value={filters.project} />
          <input type="hidden" name="assignee" value={filters.assignee} />
          <input type="hidden" name="status_filter" value={filters.status} />
          <div className="sm:col-span-2">
            <Field label="Title">
              <input className={inputClass} name="title" required />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <textarea className={inputClass} name="description" rows={2} />
            </Field>
          </div>
          <Field label="Project (optional)">
            <select className={inputClass} name="project_id" defaultValue="">
              <option value="">No project</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select className={inputClass} name="assignee_id" defaultValue="">
              <option value="">Unassigned</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                  {p.id === meId ? " (me)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input className={inputClass} name="due_date" type="date" />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className={buttonClass} type="submit">
              Create task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
