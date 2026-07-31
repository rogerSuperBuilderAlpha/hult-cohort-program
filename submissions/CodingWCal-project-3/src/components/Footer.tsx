import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-vibe-border dark:border-vibe-border-dark">
      <div className="mx-auto max-w-[1280px] px-8 max-md:px-5 py-8 flex max-sm:flex-col max-sm:gap-4 items-center justify-between text-xs text-vibe-muted">
        <p>Cursor Boston × Hult 2026</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-vibe-accent transition-colors">
            Featured
          </Link>
          <Link
            href="/projects"
            className="hover:text-vibe-accent transition-colors"
          >
            All Projects
          </Link>
          <Link
            href="/members"
            className="hover:text-vibe-accent transition-colors"
          >
            Members
          </Link>
        </div>
      </div>
    </footer>
  );
}
