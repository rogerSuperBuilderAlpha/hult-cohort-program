"use client";

import { useState } from "react";
import Link from "next/link";
import { QuickConnectModal } from "@/components/QuickConnectModal";
import type { Builder } from "@/lib/types";

export function ProfileActions({ builder }: { builder: Builder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm">
        Quick Connect
      </button>
      <Link
        href={`/partners?developer=${builder.handle}`}
        className="btn-ghost text-sm"
      >
        Request intro
      </Link>
      <QuickConnectModal
        builder={builder}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
