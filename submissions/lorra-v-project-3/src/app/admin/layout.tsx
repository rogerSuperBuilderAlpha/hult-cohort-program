import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireAdmin } from "@/lib/auth/session";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
      <aside className="md:w-52 md:shrink-0">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          <span className="text-foreground">Comen</span>
          <span className="text-accent">tiq</span>
        </Link>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent-coral">
          Admin
        </p>
        <p className="mt-4 truncate text-sm text-foreground">
          {profile.name || profile.email}
        </p>

        <nav
          className="mt-6 flex flex-row flex-wrap gap-2 md:flex-col md:gap-1"
          aria-label="Admin"
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
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm text-foreground-muted transition hover:bg-background-muted hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </nav>

        <div className="mt-6 border-t border-border pt-4">
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
