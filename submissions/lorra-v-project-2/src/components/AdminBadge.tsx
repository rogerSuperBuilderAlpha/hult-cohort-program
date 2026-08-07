/** Visible badge for profiles.role === "admin" (same field ensureProfileForUser sets). */
export function AdminBadge({ className = "" }: { className?: string }) {
  return (
    <span
      data-testid="admin-badge"
      className={[
        "inline-flex shrink-0 items-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_35%,white)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-dark)]",
        className,
      ].join(" ")}
    >
      Admin
    </span>
  );
}
