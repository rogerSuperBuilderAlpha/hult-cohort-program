import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import { SubmitButton } from "./SubmitButton";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-lockup">
          <Link href="/dashboard" className="brand">
            Pilot
          </Link>
          <span className="brand-sub">Hult Cohort PM</span>
        </div>
        <nav className="nav">
          <Link href="/dashboard">Board</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/tasks">Tasks</Link>
        </nav>
        <div className="user-chip">
          <span>
            @{user.username}
          </span>
          <form action={logoutAction}>
            <SubmitButton className="ghost-btn">Sign out</SubmitButton>
          </form>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
