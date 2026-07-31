import Link from "next/link";

type Accent = "projects" | "builders" | "partners";

const accentText: Record<Accent, string> = {
  projects: "text-accent-projects",
  builders: "text-accent-builders",
  partners: "text-accent-partners",
};

type Props = {
  href: string;
  children: React.ReactNode;
  accent?: Accent;
  className?: string;
};

export function TextLink({
  href,
  children,
  accent = "projects",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={[
        "group/arrow inline-flex cursor-pointer items-center gap-2 text-sm font-medium transition",
        accentText[accent],
        "hover:opacity-90",
        className,
      ].join(" ")}
    >
      <span>{children}</span>
      <span className="arrow-icon inline-flex" aria-hidden>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="transition-transform duration-300 group-hover/arrow:translate-x-1"
        >
          <path
            d="M3.5 9H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9.5 4.5L14 9L9.5 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
