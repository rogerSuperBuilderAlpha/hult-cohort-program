import { type HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-xl border border-border bg-background-elevated p-6",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={["mb-4 space-y-1", className].join(" ")} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={["font-display text-xl font-semibold tracking-tight", className].join(
        " ",
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={["text-sm text-foreground-muted leading-relaxed", className].join(
        " ",
      )}
      {...props}
    />
  );
}
