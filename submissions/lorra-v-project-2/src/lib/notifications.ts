export type AppNotificationType =
  | "mention"
  | "dm"
  | "thread_reply"
  | "added_to_conversation"
  | "added_to_channel"
  | "forth_assigned"
  | "forth_status";

export type AppNotification = {
  id: string;
  user_id: string;
  type: AppNotificationType | string;
  actor_id: string | null;
  entity_ref: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
};

export function hrefForEntityRef(entityRef: string): string {
  const parts = entityRef.split(":");
  if (parts[0] === "thread" && parts.length >= 4) {
    const rootId = parts[1];
    if (parts[2] === "channel") return `/channels/${parts[3]}?thread=${rootId}`;
    if (parts[2] === "conversation") return `/messages/${parts[3]}?thread=${rootId}`;
  }
  if (parts[0] === "channel" && parts.length >= 2) {
    return `/channels/${parts[1]}`;
  }
  if (parts[0] === "conversation" && parts.length >= 2) {
    return `/messages/${parts[1]}`;
  }
  if (parts[0] === "forth" && parts.length >= 2) {
    const base =
      process.env.NEXT_PUBLIC_FORTH_BASE_URL?.replace(/\/$/, "") ||
      "https://forth-bice.vercel.app";
    return `${base}/t/${parts[1]}`;
  }
  return "/";
}

export function labelForNotification(n: AppNotification): string {
  const who = n.actor?.display_name || "Someone";
  switch (n.type) {
    case "mention":
      return `${who} mentioned you`;
    case "dm":
      return `${who} sent a direct message`;
    case "thread_reply":
      return `${who} replied in a thread`;
    case "added_to_conversation":
      return `${who} added you to a conversation`;
    case "added_to_channel":
      return `${who} added you to a channel`;
    case "forth_assigned":
      return "A Forth ticket was assigned to you";
    case "forth_status":
      return "A linked Forth ticket changed status";
    default:
      return `${who} sent a notification`;
  }
}
