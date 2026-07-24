export type UserRole = "admin" | "member";
export type UserStatus = "active" | "pending" | "deactivated";
export type ChannelType = "public" | "private";
export type NotificationLevel = "all" | "mentions" | "mute";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
};

export type Channel = {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  type: ChannelType;
  created_by: string | null;
  is_archived: boolean;
  admin_post_only: boolean;
  created_at: string;
};

export type ChannelMember = {
  channel_id: string;
  user_id: string;
  last_read_at: string | null;
  notification_level: NotificationLevel;
  profiles?: Pick<Profile, "id" | "display_name" | "avatar_url" | "email" | "role">;
};

export type Reaction = {
  message_id: string;
  user_id: string;
  emoji: string;
};

export type Attachment = {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
};

export type Mention = {
  message_id: string;
  mentioned_user_id: string;
};

export type Message = {
  id: string;
  parent_type: "channel" | "conversation";
  parent_id: string;
  thread_root_id: string | null;
  author_id: string;
  body_richtext: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  profiles?: Pick<Profile, "id" | "display_name" | "avatar_url" | "email">;
  reactions?: Reaction[];
  attachments?: Attachment[];
  mentions?: Mention[];
  reply_count?: number;
  last_reply_at?: string | null;
  participants?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  }[];
  /** Attached Forth TicketLink when this message is a ticket card. */
  ticket_link?: {
    id: string;
    forth_ticket_id: string;
    forth_url: string;
    title_snapshot: string;
    status_snapshot: string;
    assignee_email_snapshot: string | null;
    last_synced_at: string;
  } | null;
};

export const REACTION_EMOJI = ["👍", "❤️", "🎉", "👀", "😄"] as const;

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
];
