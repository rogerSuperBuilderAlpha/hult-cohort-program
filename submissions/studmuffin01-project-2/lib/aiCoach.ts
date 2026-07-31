import type { Message, MessageFlag, WorkspaceState } from "@/lib/types";
import { FLAG_META, hasFlag } from "@/lib/messageFlags";

export const AI_SUGGESTED_PROMPTS = [
  "What needs action?",
  "What's urgent?",
  "Show unread",
  "What's archived?",
  "Summarize priorities",
] as const;

type FlaggedMessageRow = {
  id: string;
  channelName: string;
  authorName: string;
  preview: string;
  flags: MessageFlag[];
  createdAt: string;
};

type FlagSnapshot = {
  urgent: FlaggedMessageRow[];
  important: FlaggedMessageRow[];
  action: FlaggedMessageRow[];
  unread: FlaggedMessageRow[];
  archived: FlaggedMessageRow[];
  activeCount: number;
};

function previewOf(message: Message): string {
  const text = message.body.trim();
  if (text) return text.length > 100 ? `${text.slice(0, 97)}…` : text;
  if (message.attachments?.length) {
    return `[${message.attachments.length} attachment${message.attachments.length === 1 ? "" : "s"}]`;
  }
  if (message.taskLink) return `Task: ${message.taskLink.taskLabel}`;
  return "(empty message)";
}

function channelName(state: WorkspaceState, channelId: string): string {
  const channel = state.channels.find((c) => c.id === channelId);
  if (!channel) return "unknown";
  if (channel.kind === "channel") return `#${channel.name}`;
  return channel.name;
}

function toRow(state: WorkspaceState, message: Message): FlaggedMessageRow {
  return {
    id: message.id,
    channelName: channelName(state, message.channelId),
    authorName:
      state.members.find((m) => m.id === message.authorId)?.name ?? "Unknown",
    preview: previewOf(message),
    flags: message.flags ?? [],
    createdAt: message.createdAt,
  };
}

function buildFlagSnapshot(state: WorkspaceState): FlagSnapshot {
  const withFlags = state.messages.filter((m) => (m.flags?.length ?? 0) > 0);
  const by = (flag: MessageFlag) =>
    withFlags
      .filter((m) => hasFlag(m.flags, flag))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((m) => toRow(state, m));

  return {
    urgent: by("urgent"),
    important: by("important"),
    action: by("action"),
    unread: by("unread"),
    archived: by("archived"),
    activeCount: state.messages.filter((m) => !hasFlag(m.flags, "archived"))
      .length,
  };
}

function listRows(rows: FlaggedMessageRow[], empty: string): string {
  if (!rows.length) return empty;
  return rows
    .slice(0, 8)
    .map(
      (r) =>
        `• ${r.channelName} — ${r.authorName}: “${r.preview}” [${r.flags
          .map((f) => FLAG_META[f].short)
          .join(", ")}]`
    )
    .join("\n");
}

function detectIntent(query: string): string {
  const text = query.trim().toLowerCase();
  if (
    text.includes("help") ||
    text.includes("what can you") ||
    text.includes("how do you")
  ) {
    return "help";
  }
  if (text.includes("unread")) return "unread";
  if (text.includes("archiv")) return "archived";
  if (
    text.includes("urgent") ||
    text.includes("asap") ||
    text.includes("critical")
  ) {
    return "urgent";
  }
  if (
    text.includes("action") ||
    text.includes("todo") ||
    text.includes("to-do") ||
    text.includes("follow up") ||
    text.includes("follow-up") ||
    text.includes("needs attention")
  ) {
    return "action";
  }
  if (
    text.includes("important") ||
    text.includes("priority") ||
    text.includes("priorit") ||
    text.includes("focus") ||
    text.includes("summar")
  ) {
    return "priorities";
  }
  return "overview";
}

export function answerFlagQuery(state: WorkspaceState, query: string): string {
  const snap = buildFlagSnapshot(state);
  const intent = detectIntent(query);

  if (intent === "help") {
    return [
      "I read message flags across Fireside.",
      "Ask me about: needs action, urgent, important, unread, or archived.",
      "Members flag messages in each chat so I can surface what needs follow-up.",
    ].join("\n");
  }

  if (intent === "urgent") {
    return [
      `Urgent items: ${snap.urgent.length}`,
      listRows(snap.urgent, "Nothing is flagged urgent right now."),
    ].join("\n");
  }

  if (intent === "action") {
    return [
      `Needs action: ${snap.action.length}`,
      listRows(
        snap.action.filter((r) => !r.flags.includes("archived")),
        "No open action-flagged messages."
      ),
    ].join("\n");
  }

  if (intent === "unread") {
    return [
      `Unread flags: ${snap.unread.length}`,
      listRows(
        snap.unread.filter((r) => !r.flags.includes("archived")),
        "No messages are marked unread."
      ),
    ].join("\n");
  }

  if (intent === "archived") {
    return [
      `Archived: ${snap.archived.length}`,
      listRows(snap.archived, "Nothing is archived yet."),
    ].join("\n");
  }

  if (intent === "priorities") {
    const openAction = snap.action.filter((r) => !r.flags.includes("archived"));
    const openUrgent = snap.urgent.filter((r) => !r.flags.includes("archived"));
    const openImportant = snap.important.filter(
      (r) => !r.flags.includes("archived")
    );
    return [
      "Priority snapshot (excluding archived):",
      `• Urgent: ${openUrgent.length}`,
      `• Needs action: ${openAction.length}`,
      `• Important: ${openImportant.length}`,
      `• Unread: ${snap.unread.filter((r) => !r.flags.includes("archived")).length}`,
      "",
      openUrgent.length || openAction.length
        ? "Top follow-ups:\n" +
          listRows(
            [...openUrgent, ...openAction]
              .filter(
                (row, i, arr) => arr.findIndex((r) => r.id === row.id) === i
              )
              .slice(0, 6),
            "None"
          )
        : "No urgent or action items — clear the board.",
    ].join("\n");
  }

  return [
    "Flag overview:",
    `• Urgent: ${snap.urgent.length}`,
    `• Important: ${snap.important.length}`,
    `• Needs action: ${snap.action.length}`,
    `• Unread: ${snap.unread.length}`,
    `• Archived: ${snap.archived.length}`,
    `• Active messages (not archived): ${snap.activeCount}`,
    "",
    "Try: “What needs action?” or “What's urgent?”",
  ].join("\n");
}
