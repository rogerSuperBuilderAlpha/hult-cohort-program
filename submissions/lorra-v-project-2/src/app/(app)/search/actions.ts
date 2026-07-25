"use server";

import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, avatar_url, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") throw new Error("Inactive profile");
  return { supabase, user, profile };
}

export type SearchHit = {
  id: string;
  parent_type: "channel" | "conversation";
  parent_id: string;
  body_richtext: string;
  created_at: string;
  author_id: string;
  author_name: string | null;
  channel_slug: string | null;
  href: string;
};

async function searchViaIlike(
  supabase: Awaited<ReturnType<typeof createClient>>,
  q: string,
  channelId: string | null,
  limit: number,
): Promise<
  {
    id: string;
    parent_type: string;
    parent_id: string;
    body_richtext: string;
    created_at: string;
    author_id: string;
  }[]
> {
  let query = supabase
    .from("messages")
    .select("id, parent_type, parent_id, body_richtext, created_at, author_id")
    .is("deleted_at", null)
    .ilike("body_richtext", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (channelId) {
    query = query.eq("parent_type", "channel").eq("parent_id", channelId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as {
    id: string;
    parent_type: string;
    parent_id: string;
    body_richtext: string;
    created_at: string;
    author_id: string;
  }[];
}

/**
 * Keyword search across visible messages (PRD §4.5).
 * Prefers Postgres FTS RPC from migration 005; falls back to ilike.
 */
export async function searchMessages(input: {
  q: string;
  channelId?: string | null;
  limit?: number;
}): Promise<SearchHit[]> {
  const q = input.q.trim();
  if (q.length < 2) return [];

  const { supabase } = await requireUser();
  const limit = Math.min(Math.max(input.limit ?? 40, 1), 100);
  const channelId = input.channelId ?? null;

  let rows: {
    id: string;
    parent_type: string;
    parent_id: string;
    body_richtext: string;
    created_at: string;
    author_id: string;
  }[] = [];

  const { data: ftsRows, error: ftsErr } = await supabase.rpc("search_messages", {
    query: q,
    p_channel_id: channelId,
    lim: limit,
  });

  if (!ftsErr && Array.isArray(ftsRows)) {
    rows = ftsRows as typeof rows;
  } else {
    rows = await searchViaIlike(supabase, q, channelId, limit);
  }

  if (!rows.length) return [];

  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const channelIds = Array.from(
    new Set(
      rows.filter((r) => r.parent_type === "channel").map((r) => r.parent_id),
    ),
  );

  const [{ data: authors }, { data: channels }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", authorIds),
    channelIds.length
      ? supabase.from("channels").select("id, name").in("id", channelIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const authorName = new Map(
    (authors ?? []).map((a) => [a.id as string, a.display_name as string]),
  );
  const channelSlug = new Map(
    (channels ?? []).map((c) => [c.id as string, c.name as string]),
  );

  return rows.map((r) => {
    const slug =
      r.parent_type === "channel" ? channelSlug.get(r.parent_id) ?? null : null;
    const href =
      r.parent_type === "channel" && slug
        ? `/channels/${slug}?thread=${r.id}`
        : `/messages/${r.parent_id}?thread=${r.id}`;
    return {
      id: r.id,
      parent_type: r.parent_type as "channel" | "conversation",
      parent_id: r.parent_id,
      body_richtext: r.body_richtext,
      created_at: r.created_at,
      author_id: r.author_id,
      author_name: authorName.get(r.author_id) ?? null,
      channel_slug: slug,
      href,
    };
  });
}
