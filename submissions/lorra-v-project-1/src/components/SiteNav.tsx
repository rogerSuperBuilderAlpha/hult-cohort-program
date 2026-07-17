import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "MVP Admin" },
];

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <header className="border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_85%,black)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--accent)]"
        >
          Mission Control
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--ink)]">
              {link.label}
            </Link>
          ))}
          <Link href={`/profile/${user.id}`} className="hover:text-[var(--ink)]">
            {profile?.display_name ?? "Profile"}
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
