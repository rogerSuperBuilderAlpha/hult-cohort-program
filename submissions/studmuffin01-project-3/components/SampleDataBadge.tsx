type Props = {
  /** Compact chip for cards; default is the full label. */
  compact?: boolean;
  className?: string;
};

/** Visible marker for seed / fictional directory content. */
export function SampleDataBadge({ compact = false, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center border border-[var(--line-strong)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)] ${className}`}
      title="Illustrative seed content — not a live cohort member or partner"
    >
      {compact ? "Sample" : "Sample data"}
    </span>
  );
}
