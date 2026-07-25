"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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
  const { userId, isAuthLoaded } = useSupabaseUser();

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
        <div className="flex shrink-0 items-start gap-2">
          {isAuthLoaded && userId ? (
            <LogoutButton compact />
          ) : isAuthLoaded ? (
            <Link
              href="/auth/login"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 dark:border-surface-border dark:bg-surface-card dark:text-surface-primary dark:hover:bg-surface-border/60"
            >
              Log in
            </Link>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
