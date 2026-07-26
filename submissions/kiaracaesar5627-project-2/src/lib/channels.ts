import type { Channel } from "./types";

/** Display label for a channel (Announcements has no # prefix). */
export function channelLabel(channel: Pick<Channel, "name" | "kind">) {
  if (channel.kind === "announcements") return channel.name;
  return `#${channel.name}`;
}
