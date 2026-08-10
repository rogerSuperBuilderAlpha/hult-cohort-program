"use client";

import Link from "next/link";
import { Construction } from "lucide-react";

import { getModuleMeta } from "@/lib/course/modules";

type ModuleUnavailableProps = {
  moduleId: string;
};

export function ModuleUnavailable({ moduleId }: ModuleUnavailableProps) {
  const meta = getModuleMeta(moduleId);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Construction className="mx-auto size-10 text-lex-navy/35" aria-hidden />
      <h1 className="mt-4 font-serif text-2xl font-semibold text-lex-navy">
        {meta?.title ?? "Module"} — coming soon
      </h1>
      <p className="mt-2 text-lex-navy/70">
        This module is not available yet. Complete Module 1 and check back as
        new lessons are released.
      </p>
      <Link
        href="/learn"
        className="mt-6 inline-flex rounded-lg bg-lex-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-lex-navy/90"
      >
        Back to modules
      </Link>
    </div>
  );
}
