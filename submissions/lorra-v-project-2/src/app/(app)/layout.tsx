import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { listConversations } from "@/app/(app)/messages/actions";
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

  const { data: channels } = await supabase
    .from("channels")
    .select("id, name")
    .eq("is_archived", false)
    .order("name", { ascending: true });

  let dms: { id: string; title: string; peerIds: string[] }[] = [];
  try {
    const conversations = await listConversations();
    dms = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      peerIds: c.member_ids.filter((id) => id !== user.id),
    }));
  } catch {
    dms = [];
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: profile?.email ?? user.email ?? "",
        displayName: profile?.display_name ?? user.email ?? "Member",
        role: profile?.role ?? "member",
        avatarUrl: profile?.avatar_url ?? null,
      }}
      channels={channels ?? []}
      dms={dms}
    >
      {children}
    </AppShell>
  );
}
