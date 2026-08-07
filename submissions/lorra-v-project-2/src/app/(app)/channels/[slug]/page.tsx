import { notFound, redirect } from "next/navigation";
import { ChannelView } from "@/components/ChannelView";
import { createClient } from "@/lib/supabase/server";
import {
  getChannelBySlug,
  listChannelMembers,
  listChannelMessages,
} from "@/app/(app)/channels/actions";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ thread?: string }>;
}) {
  const { slug } = await params;
  const { thread: initialThreadId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const channel = await getChannelBySlug(slug);
  if (!channel) notFound();

  const [messages, members] = await Promise.all([
    listChannelMessages(channel.id),
    listChannelMembers(channel.id),
  ]);

  return (
    <ChannelView
      channel={channel}
      currentUser={{
        id: user.id,
        role: profile?.role ?? "member",
        displayName: profile?.display_name ?? user.email ?? "Member",
      }}
      initialMessages={messages}
      initialMembers={members}
      initialThreadId={initialThreadId ?? null}
    />
  );
}
