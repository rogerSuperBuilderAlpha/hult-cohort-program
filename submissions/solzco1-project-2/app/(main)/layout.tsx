import { AppSidebar } from "@/components/app-sidebar";
import { NotificationsPanel } from "@/components/notifications-panel";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/actions";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-col md:w-64 md:shrink-0">
        <AppSidebar />
        <div className="hidden border-r border-moss/20 p-4 md:block">
          <NotificationsPanel />
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="min-h-[44px] w-full rounded border border-moss/40 px-3 py-2 text-sm"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
