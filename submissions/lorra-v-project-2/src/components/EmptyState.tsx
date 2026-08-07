import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_srgb,var(--color-secondary)_30%,transparent)] bg-[var(--color-bg)] px-6 py-10 text-center"
    >
      <p className="text-sm font-semibold text-[var(--color-dark)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="skeleton"
      className={[
        "animate-pulse rounded-[var(--radius-card)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]",
        className,
      ].join(" ")}
    />
  );
}
