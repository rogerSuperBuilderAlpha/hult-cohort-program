import { notFound } from "next/navigation";
import {
  getConversation,
  listConversationMembers,
} from "@/app/(app)/messages/actions";
import { listParentMessages } from "@/app/(app)/messaging/actions";
import { DmView } from "@/components/DmView";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ thread?: string }>;
}) {
  const { id } = await params;
  const { thread: initialThreadId } = await searchParams;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const [messages, members] = await Promise.all([
    listParentMessages("conversation", conversation.id),
    listConversationMembers(conversation.id),
  ]);

  return (
    <DmView
      conversation={conversation}
      currentUser={{
        id: user.id,
        role: profile?.role ?? "member",
        displayName: profile?.display_name ?? "Member",
      }}
      initialMessages={messages}
      initialMembers={members}
      initialThreadId={initialThreadId ?? null}
    />
  );
}
