import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function AppSidebar() {
  const { user } = await requireProfile();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("is_dm", false)
    .order("name");

  const { data: memberships } = await supabase
    .from("channel_members")
    .select("channel_id, channels(*)")
    .eq("user_id", user.id);

  const dmChannels =
    memberships
      ?.map((m) => m.channels as unknown as import("@/lib/types").Channel)
      .filter((c) => c?.is_dm) ?? [];

  return (
    <aside className="w-full border-b border-moss/20 bg-paper-dark/50 md:w-64 md:min-h-screen md:border-b-0 md:border-r md:shrink-0">
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-moss">Cohort Comms</p>
        <p className="font-serif text-lg">{profile.display_name}</p>
        <p className="truncate text-xs text-ink/70">{profile.email}</p>
      </div>
      <nav className="px-2 pb-4" aria-label="Channels">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-moss">Channels</p>
        <ul className="space-y-0.5">
          {(channels ?? []).map((ch) => (
            <li key={ch.id}>
              <Link
                href={`/channels/${ch.slug}`}
                className="block rounded px-2 py-2 text-sm hover:bg-moss/10"
              >
                # {ch.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 px-2 py-1 text-xs font-semibold uppercase text-moss">Direct</p>
        <ul className="space-y-0.5">
          {dmChannels.map((ch) => (
            <li key={ch.id}>
              <Link
                href={`/dm/${ch.id}`}
                className="block rounded px-2 py-2 text-sm hover:bg-moss/10"
              >
                {ch.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 px-2">
          <Link href="/search" className="block rounded px-2 py-2 text-sm hover:bg-moss/10">
            Search
          </Link>
          <Link href="/members" className="block rounded px-2 py-2 text-sm hover:bg-moss/10">
            Members &amp; DMs
          </Link>
        </div>
      </nav>
    </aside>
  );
}
