export type ChannelKind = "channel" | "dm" | "group";

export type Channel = {
  id: string;
  kind: ChannelKind;
  name: string;
  description?: string;
  memberIds?: string[];
  /** Set for group chats — only this user can add/remove members. */
  createdById?: string;
  unread?: number;
};

export type Member = {
  id: string;
  name: string;
  handle: string;
  role: string;
  status: "online" | "away" | "offline";
  initials: string;
};

export type TaskLink = {
  initiativeTitle: string;
  taskLabel: string;
  url: string;
};

export type AttachmentKind =
  | "image"
  | "drawing"
  | "document"
  | "pdf"
  | "audio"
  | "video"
  | "file";

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  /** Data URL for demo persistence (localStorage). */
  dataUrl: string;
};

/** Collaborative message flags — used by members and the AI chatbox. */
export type MessageFlag =
  | "important"
  | "urgent"
  | "action"
  | "archived"
  | "unread";

export type Message = {
  id: string;
  channelId: string;
  authorId: string;
  body: string;
  createdAt: string;
  threadParentId?: string;
  replyCount?: number;
  taskLink?: TaskLink;
  reactions?: { emoji: string; count: number }[];
  attachments?: Attachment[];
  flags?: MessageFlag[];
};

export type WorkspaceState = {
  channels: Channel[];
  members: Member[];
  messages: Message[];
  currentUserId: string;
  activeChannelId: string;
};
