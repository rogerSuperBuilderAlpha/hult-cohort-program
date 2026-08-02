"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectUpdateAction } from "@/app/dashboard/projects/[id]/updates/actions";
import { Button } from "@/components/ui/Button";

type Props = {
  projectId: string;
  updateId: string;
};

export function DeleteUpdateButton({ projectId, updateId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this update?")) return;
        startTransition(async () => {
          await deleteProjectUpdateAction(projectId, updateId);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
