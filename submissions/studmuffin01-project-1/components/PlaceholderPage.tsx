import Link from "next/link";
import CommandCenterPageShell from "@/components/CommandCenterPageShell";
import CommandCenterRow from "@/components/CommandCenterRow";
import PageHeader from "@/components/PageHeader";

interface PlaceholderPageProps {
  title: string;
  message?: string;
  linkLabel?: string;
}

export default function PlaceholderPage({
  title,
  message = "This page is under development. Check back soon for updates.",
  linkLabel = "View your dashboard",
}: PlaceholderPageProps) {
  return (
    <CommandCenterPageShell
      header={
        <PageHeader
          backHref="/"
          backLabel="← Back to Executive Summary"
          title={title}
          subtitle={undefined}
        />
      }
    >
      <CommandCenterRow>
        <main className="w-full px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white p-8 shadow-md ring-1 ring-slate-200 dark:bg-surface-card dark:shadow-none dark:ring-surface-border">
            <p className="text-slate-600 dark:text-surface-secondary">{message}</p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-400"
            >
              {linkLabel}
            </Link>
          </div>
        </main>
      </CommandCenterRow>
    </CommandCenterPageShell>
  );
}
