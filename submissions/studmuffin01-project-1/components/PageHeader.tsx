"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface PageHeaderProps {
  id?: string;
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
}

export default function PageHeader({
  id,
  backHref,
  backLabel,
  title = "INITIARA",
  subtitle = "The Gateway to Project Success",
}: PageHeaderProps) {
  return (
    <header
      id={id}
      className="scroll-mt-0 bg-brand-700 shadow-lg dark:border-b dark:border-surface-border dark:bg-surface-card dark:shadow-none"
    >
      <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          {backHref && backLabel && (
            <Link
              href={backHref}
              className="text-sm font-medium text-brand-100 transition-colors hover:text-white dark:text-surface-secondary dark:hover:text-surface-primary"
            >
              {backLabel}
            </Link>
          )}
          <h1
            className={`font-display text-3xl font-extrabold tracking-wide text-white dark:text-surface-primary sm:text-4xl ${
              backHref ? "mt-3 text-2xl sm:text-3xl" : ""
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-brand-100 dark:text-surface-secondary">{subtitle}</p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
