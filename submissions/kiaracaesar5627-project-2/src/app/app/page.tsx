import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listChannels } from "@/lib/db";

export default async function AppIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const channels = await listChannels();
  const general =
    channels.find((c) => c.slug === "general") ??
    channels.find((c) => c.kind === "public") ??
    channels[0];
  redirect(general ? `/app/c/${general.slug}` : "/app/channels/new");
}
