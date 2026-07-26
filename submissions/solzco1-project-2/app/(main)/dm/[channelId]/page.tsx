import { notFound } from "next/navigation";
import { ChannelChat } from "@/components/channel-chat";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

type Props = { params: { channelId: string } };

export default async function DmPage({ params }: Props) {
  const { user } = await requireProfile();
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", params.channelId)
    .eq("is_dm", true)
    .maybeSingle();

  if (!channel) notFound();

  const { data: member } = await supabase
    .from("channel_members")
    .select("user_id")
    .eq("channel_id", channel.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, profiles(display_name, email)")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: true });

  return (
    <>
      <header className="border-b border-moss/20 px-4 py-3">
        <h1 className="font-serif text-2xl text-ink">{channel.name}</h1>
        <p className="text-sm text-ink/70">Direct message</p>
      </header>
      <ChannelChat
        channelId={channel.id}
        initialMessages={(messages ?? []) as Message[]}
        canPost
      />
    </>
  );
}
