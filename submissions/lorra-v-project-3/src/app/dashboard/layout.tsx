import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth/session";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/copilot", label: "Copilot" },
  { href: "/dashboard/amplify", label: "Amplify" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
      <aside className="md:w-52 md:shrink-0">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          <span className="text-foreground">Comen</span>
          <span className="text-accent">tiq</span>
        </Link>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-foreground-muted">
          Dashboard
        </p>
        <p className="mt-4 truncate text-sm text-foreground">
          {profile.name || profile.email}
        </p>
        <p className="truncate text-xs text-foreground-muted">{profile.email}</p>
        {profile.role === "admin" ? (
          <p className="mt-2 inline-flex rounded-md border border-accent-coral/40 bg-accent-coral/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-accent-coral">
            Admin
          </p>
        ) : null}

        <nav
          className="mt-6 flex flex-row flex-wrap gap-2 md:flex-col md:gap-1"
          aria-label="Dashboard"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-foreground-muted transition hover:bg-background-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {profile.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm text-accent-coral transition hover:bg-background-muted"
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="mt-6 border-t border-border pt-4">
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
