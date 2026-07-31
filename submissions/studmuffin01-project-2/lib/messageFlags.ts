import type { MessageFlag } from "@/lib/types";

export const MESSAGE_FLAGS: MessageFlag[] = [
  "urgent",
  "important",
  "action",
  "unread",
  "archived",
];

export const FLAG_META: Record<
  MessageFlag,
  { label: string; short: string; hint: string }
> = {
  urgent: {
    label: "Urgent",
    short: "Urgent",
    hint: "Needs attention soon",
  },
  important: {
    label: "Important",
    short: "Important",
    hint: "High priority context",
  },
  action: {
    label: "Needs action",
    short: "Action",
    hint: "Someone must follow up",
  },
  unread: {
    label: "Unread",
    short: "Unread",
    hint: "Mark to come back later",
  },
  archived: {
    label: "Archived",
    short: "Archived",
    hint: "Done / out of active view",
  },
};

export function hasFlag(
  flags: MessageFlag[] | undefined,
  flag: MessageFlag
): boolean {
  return !!flags?.includes(flag);
}

export function toggleFlagInList(
  flags: MessageFlag[] | undefined,
  flag: MessageFlag
): MessageFlag[] {
  const current = flags ?? [];
  if (current.includes(flag)) {
    return current.filter((f) => f !== flag);
  }
  return [...current, flag];
}
