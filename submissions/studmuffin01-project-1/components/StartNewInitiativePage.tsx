"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommandCenterRow from "@/components/CommandCenterRow";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { useInitiatives } from "@/hooks/useInitiatives";
import { INITIATIVE_TITLE_MAX_LENGTH, sanitizeInitiativeTitle } from "@/lib/initiatives";

export default function StartNewInitiativePage() {
  const router = useRouter();
  const { addInitiative, isLoaded } = useInitiatives();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedName = sanitizeInitiativeTitle(name);
    if (!sanitizedName) {
      setError("Enter a name for your initiative.");
      return;
    }

    const created = addInitiative(sanitizedName);
    if (!created) {
      setError("Could not add your initiative. Try again.");
      return;
    }

    router.push("/");
  };

  return (
    <PageShell
      header={
        <PageHeader
          backHref="/"
          backLabel="← Back to Executive Summary"
          title="Start New Initiative"
          subtitle={undefined}
        />
      }
    >
      <CommandCenterRow>
        <main className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white p-8 shadow-md ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border">
            <p className="text-slate-600 dark:text-surface-secondary">
              Enter a name below to add the next row in the Executive Summary. Your first entry
              appears in row 1, the second in row 2, and so on. A new row is added each time you
              submit from this page.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
              <div>
                <label
                  htmlFor="initiative-name"
                  className="block text-sm font-semibold text-slate-900 dark:text-surface-primary"
                >
                  Name Your Initiative
                </label>
                <input
                  id="initiative-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={INITIATIVE_TITLE_MAX_LENGTH}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={!isLoaded}
                  placeholder="e.g. Week 7 - Customer Feedback Portal"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary dark:placeholder:text-surface-secondary"
                />
                {error && (
                  <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isLoaded || !name.trim()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-2 dark:focus:ring-brand-500 dark:focus:ring-offset-2 dark:focus:ring-offset-surface-card"
              >
                Add to Executive Summary
              </button>
            </form>

            <Link
              href="/"
              className="mt-8 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
            >
              View cohort progress on the dashboard
            </Link>
          </div>
        </main>
      </CommandCenterRow>
    </PageShell>
  );
}
