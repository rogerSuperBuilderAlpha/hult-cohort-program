import { type HTMLAttributes } from "react";

type Tone =
  | "default"
  | "accent"
  | "projects"
  | "builders"
  | "partners"
  | "coral"
  | "sky"
  | "muted";

const tones: Record<Tone, string> = {
  default: "border-border bg-background-muted text-foreground",
  accent: "border-accent/40 bg-accent/10 text-accent",
  projects:
    "border-accent-projects/40 bg-accent-projects/10 text-accent-projects",
  builders:
    "border-accent-builders/40 bg-accent-builders/10 text-accent-builders",
  partners:
    "border-accent-partners/40 bg-accent-partners/10 text-accent-partners",
  coral: "border-accent-coral/40 bg-accent-coral/10 text-accent-coral",
  sky: "border-accent-sky/40 bg-accent-sky/10 text-accent-sky",
  muted: "border-border bg-transparent text-foreground-muted",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({
  className = "",
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
