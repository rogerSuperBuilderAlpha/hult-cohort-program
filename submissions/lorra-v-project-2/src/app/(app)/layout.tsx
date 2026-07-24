import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell
      user={{
        id: user.id,
        email: profile?.email ?? user.email ?? "",
        displayName: profile?.display_name ?? user.email ?? "Member",
        role: profile?.role ?? "member",
        avatarUrl: profile?.avatar_url ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
