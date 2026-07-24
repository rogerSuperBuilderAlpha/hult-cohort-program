import { notFound } from "next/navigation";
import { ChannelAdminTools } from "@/components/channel-admin-tools";
import { ChannelChat } from "@/components/channel-chat";
import { CreateChannelForm } from "@/components/create-channel-form";
import { isAdminProfile } from "@/lib/admin";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

type Props = { params: { slug: string } };

export default async function ChannelPage({ params }: Props) {
  const { user } = await requireProfile();
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_dm", false)
    .maybeSingle();

  if (!channel || channel.archived) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, profiles(display_name, email)")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: true });

  const isAdmin = isAdminProfile(profile);
  const isAnnouncements = channel.slug === "announcements";
  const canPost = !isAnnouncements || isAdmin;

  return (
    <>
      <header className="border-b border-moss/20 px-4 py-3">
        <h1 className="font-serif text-2xl text-ink"># {channel.name}</h1>
        {isAnnouncements && !isAdmin && (
          <p className="text-sm text-ink/70">Announcements are posted by cohort staff only.</p>
        )}
      </header>
      <ChannelAdminTools
        channelId={channel.id}
        channelName={channel.name}
        isAdmin={isAdmin}
      />
      <CreateChannelForm />
      <ChannelChat
        channelId={channel.id}
        initialMessages={(messages ?? []) as Message[]}
        canPost={canPost}
        readOnlyHint={
          isAnnouncements ? "Only admins can post in this channel." : undefined
        }
      />
    </>
  );
}
