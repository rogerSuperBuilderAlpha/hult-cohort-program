"use client";

import { useTransition } from "react";
import { deleteProject } from "@/lib/actions/project";

export function DeleteButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Delete this project? This action cannot be undone.")) {
      startTransition(() => deleteProject(slug));
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
