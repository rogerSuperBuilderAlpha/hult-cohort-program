type SpinnerProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md";
  /** When false, only the spinning indicator is shown (for buttons). */
  showLabel?: boolean;
};

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
};

export function Spinner({
  label = "Loading",
  className = "",
  size = "md",
  showLabel = true,
}: SpinnerProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-3 text-sm text-foreground-muted",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={[
          "animate-spin rounded-full border-border border-t-accent",
          sizes[size],
        ].join(" ")}
        aria-hidden
      />
      {showLabel ? <span>{label}</span> : null}
    </div>
  );
}
