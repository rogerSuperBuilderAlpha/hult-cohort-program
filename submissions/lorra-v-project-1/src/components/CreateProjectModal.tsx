"use client";

import { useState } from "react";
import { createProject } from "@/app/actions/projects";
import { Modal } from "@/components/Modal";
import { Field, buttonClass, inputClass } from "@/components/ui";

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        Create Project
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create project">
        <form action={createProject} className="grid gap-4">
          <Field label="Name">
            <input className={inputClass} name="name" required />
          </Field>
          <Field label="Description (optional)">
            <textarea className={inputClass} name="description" rows={3} />
          </Field>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className={buttonClass} type="submit">
              Create project
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
