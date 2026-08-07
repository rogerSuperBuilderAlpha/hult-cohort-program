import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, signOut } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            🚀 Momentum
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/projects" className="text-sm text-slate-300 hover:text-white">
            Projects
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-400">{user.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="text-sm text-slate-400 hover:text-white" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
