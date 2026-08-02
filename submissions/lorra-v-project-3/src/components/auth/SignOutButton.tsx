"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-full justify-start px-3"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
