import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";
type Accent = "brand" | "projects" | "builders" | "partners";

const accentFill: Record<Accent, string> = {
  brand:
    "bg-accent text-accent-foreground hover:brightness-110 focus-visible:ring-accent",
  projects:
    "bg-accent-projects text-accent-foreground hover:brightness-110 focus-visible:ring-accent-projects",
  builders:
    "bg-accent-builders text-accent-foreground hover:brightness-110 focus-visible:ring-accent-builders",
  partners:
    "bg-accent-partners text-accent-foreground hover:brightness-110 focus-visible:ring-accent-partners",
};

const accentOutline: Record<Accent, string> = {
  brand:
    "bg-background/50 text-foreground border border-border hover:border-accent hover:text-accent focus-visible:ring-accent",
  projects:
    "bg-background/50 text-foreground border border-accent-projects/50 hover:border-accent-projects hover:text-accent-projects focus-visible:ring-accent-projects",
  builders:
    "bg-background/50 text-foreground border border-accent-builders/60 hover:border-accent-builders hover:bg-accent-builders/10 hover:text-accent-builders focus-visible:ring-accent-builders",
  partners:
    "bg-background/40 text-foreground border border-accent-partners/50 hover:border-accent-partners hover:bg-accent-partners/10 hover:text-accent-partners focus-visible:ring-accent-partners",
};

const variants: Record<Variant, string> = {
  primary: "", // resolved with accent
  secondary:
    "bg-background-muted text-foreground border border-border hover:border-border-strong hover:bg-background-elevated focus-visible:ring-accent-sky",
  ghost:
    "bg-transparent text-foreground hover:bg-background-muted focus-visible:ring-accent-sky",
  danger:
    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25 focus-visible:ring-danger",
  outline: "", // resolved with accent
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  accent?: Accent;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  accent = "brand",
  type = "button",
  ...props
}: ButtonProps) {
  const accentClass =
    variant === "primary"
      ? accentFill[accent]
      : variant === "outline"
        ? accentOutline[accent]
        : variants[variant];

  return (
    <button
      type={type}
      className={[
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        accentClass,
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
