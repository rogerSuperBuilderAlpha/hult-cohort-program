import { type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  className = "",
  label,
  hint,
  error,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground",
          "placeholder:text-foreground-muted/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          error ? "border-danger" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs text-danger">
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span id={hintId} className="text-xs text-foreground-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
