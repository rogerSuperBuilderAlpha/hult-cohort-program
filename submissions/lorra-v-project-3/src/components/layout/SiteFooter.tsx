import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-base font-semibold tracking-tight">
            <span className="text-foreground">Comen</span>
            <span className="text-accent-projects">tiq</span>
          </p>
          <p className="max-w-md text-sm leading-relaxed text-foreground-muted">
            Collective momentum,{" "}
            <span className="text-accent-projects">intelligently amplified</span>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-foreground-muted">
          <Link
            href="/projects"
            className="cursor-pointer hover:text-accent-projects"
          >
            Projects
          </Link>
          <Link
            href="/builders"
            className="cursor-pointer hover:text-accent-builders"
          >
            Builders
          </Link>
          <Link
            href="/partners"
            className="cursor-pointer hover:text-accent-partners"
          >
            Partners
          </Link>
          <Link href="/dashboard" className="cursor-pointer hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
