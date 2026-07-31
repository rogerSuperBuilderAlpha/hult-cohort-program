import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-vibe-border dark:border-vibe-border-dark">
      <div className="mx-auto max-w-[1280px] px-8 max-md:px-5 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Vibe<span className="text-vibe-accent">.</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-vibe-muted hover:text-vibe-accent transition-colors"
          >
            Featured
          </Link>
          <Link
            href="/projects"
            className="text-sm font-medium text-vibe-muted hover:text-vibe-accent transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/members"
            className="text-sm font-medium text-vibe-muted hover:text-vibe-accent transition-colors"
          >
            Members
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-vibe-muted hover:text-vibe-accent transition-colors"
          >
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
