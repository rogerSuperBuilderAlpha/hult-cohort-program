import type { Channel } from "./types";

/** Display label for a channel (Title Case name, no # prefix). */
export function channelLabel(channel: Pick<Channel, "name">) {
  return channel.name;
}
