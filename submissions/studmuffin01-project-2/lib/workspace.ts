import type {
  Channel,
  Message,
  MessageFlag,
  WorkspaceState,
} from "@/lib/types";
import { parseTaskSlashCommand } from "@/lib/forth";
import { newId } from "@/lib/id";
import { toggleFlagInList } from "@/lib/messageFlags";

export function channelMessages(
  state: WorkspaceState,
  channelId: string
): Message[] {
  return state.messages
    .filter((m) => m.channelId === channelId && !m.threadParentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function threadReplies(
  state: WorkspaceState,
  parentId: string
): Message[] {
  return state.messages
    .filter((m) => m.threadParentId === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function memberById(state: WorkspaceState, id: string) {
  return state.members.find((m) => m.id === id);
}

export function activeChannel(state: WorkspaceState) {
  return (
    state.channels.find((c) => c.id === state.activeChannelId) ??
    state.channels[0]
  );
}

export function isGroupCreator(channel: Channel, userId: string): boolean {
  return channel.kind === "group" && channel.createdById === userId;
}

export function createGroupChat(
  state: WorkspaceState,
  name: string,
  selectedMemberIds: string[]
): WorkspaceState {
  const trimmed = name.trim();
  const uniqueOthers = [
    ...new Set(selectedMemberIds.filter((id) => id !== state.currentUserId)),
  ];

  if (!trimmed || uniqueOthers.length === 0) return state;

  const memberIds = [state.currentUserId, ...uniqueOthers];
  const id = newId("group");
  const channel: Channel = {
    id,
    kind: "group",
    name: trimmed,
    memberIds,
    createdById: state.currentUserId,
    description: `${memberIds.length} members`,
  };

  const names = uniqueOthers
    .map((mid) => memberById(state, mid)?.name ?? "Unknown")
    .join(", ");

  const systemMessage: Message = {
    id: newId("msg"),
    channelId: id,
    authorId: state.currentUserId,
    body: `Created group “${trimmed}” with ${names}.`,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    channels: [...state.channels, channel],
    messages: [...state.messages, systemMessage],
    activeChannelId: id,
  };
}

export function addGroupMembers(
  state: WorkspaceState,
  groupId: string,
  memberIdsToAdd: string[]
): WorkspaceState {
  const channel = state.channels.find((c) => c.id === groupId);
  if (!channel || channel.kind !== "group") return state;
  if (!isGroupCreator(channel, state.currentUserId)) return state;

  const existing = new Set(channel.memberIds ?? []);
  const additions = [
    ...new Set(
      memberIdsToAdd.filter(
        (id) => id !== state.currentUserId && !existing.has(id)
      )
    ),
  ];
  if (additions.length === 0) return state;

  const memberIds = [...(channel.memberIds ?? []), ...additions];
  const addedNames = additions
    .map((mid) => memberById(state, mid)?.name ?? "Unknown")
    .join(", ");

  const systemMessage: Message = {
    id: newId("msg"),
    channelId: groupId,
    authorId: state.currentUserId,
    body: `Added ${addedNames} to the group.`,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    channels: state.channels.map((c) =>
      c.id === groupId
        ? {
            ...c,
            memberIds,
            description: `${memberIds.length} members`,
          }
        : c
    ),
    messages: [...state.messages, systemMessage],
  };
}

export function removeGroupMember(
  state: WorkspaceState,
  groupId: string,
  memberId: string
): WorkspaceState {
  const channel = state.channels.find((c) => c.id === groupId);
  if (!channel || channel.kind !== "group") return state;
  if (!isGroupCreator(channel, state.currentUserId)) return state;
  if (memberId === channel.createdById) return state;

  const memberIds = (channel.memberIds ?? []).filter((id) => id !== memberId);
  if (memberIds.length === (channel.memberIds ?? []).length) return state;

  const removedName = memberById(state, memberId)?.name ?? "Unknown";

  const systemMessage: Message = {
    id: newId("msg"),
    channelId: groupId,
    authorId: state.currentUserId,
    body: `Removed ${removedName} from the group.`,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    channels: state.channels.map((c) =>
      c.id === groupId
        ? {
            ...c,
            memberIds,
            description: `${memberIds.length} members`,
          }
        : c
    ),
    messages: [...state.messages, systemMessage],
  };
}

export function renameGroupChat(
  state: WorkspaceState,
  groupId: string,
  name: string
): WorkspaceState {
  const trimmed = name.trim();
  const channel = state.channels.find((c) => c.id === groupId);
  if (!channel || channel.kind !== "group" || !trimmed) return state;
  if (!isGroupCreator(channel, state.currentUserId)) return state;
  if (channel.name === trimmed) return state;

  const systemMessage: Message = {
    id: newId("msg"),
    channelId: groupId,
    authorId: state.currentUserId,
    body: `Renamed the group to “${trimmed}”.`,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    channels: state.channels.map((c) =>
      c.id === groupId ? { ...c, name: trimmed } : c
    ),
    messages: [...state.messages, systemMessage],
  };
}

export function toggleMessageFlag(
  state: WorkspaceState,
  messageId: string,
  flag: MessageFlag
): WorkspaceState {
  return {
    ...state,
    messages: state.messages.map((m) => {
      if (m.id !== messageId) return m;
      const flags = toggleFlagInList(m.flags, flag);
      return { ...m, flags: flags.length ? flags : undefined };
    }),
  };
}

export function postMessage(
  state: WorkspaceState,
  body: string,
  options?: { threadParentId?: string; attachments?: Message["attachments"] }
): WorkspaceState {
  const trimmed = body.trim();
  const attachments = options?.attachments?.length
    ? options.attachments
    : undefined;

  if (!trimmed && !attachments?.length) return state;

  const parsed = trimmed ? parseTaskSlashCommand(trimmed) : null;
  const finalBody = parsed?.rest ?? trimmed;
  const taskLink = parsed?.taskLink;

  const message: Message = {
    id: newId("msg"),
    channelId: state.activeChannelId,
    authorId: state.currentUserId,
    body: finalBody,
    createdAt: new Date().toISOString(),
    threadParentId: options?.threadParentId,
    taskLink,
    attachments,
  };

  let messages = [...state.messages, message];

  if (options?.threadParentId) {
    messages = messages.map((m) =>
      m.id === options.threadParentId
        ? { ...m, replyCount: (m.replyCount ?? 0) + 1 }
        : m
    );
  }

  const channels = state.channels.map((c) =>
    c.id === state.activeChannelId ? { ...c, unread: 0 } : c
  );

  return { ...state, messages, channels };
}
