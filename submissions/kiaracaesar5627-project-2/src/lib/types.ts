export type UserRole = "MEMBER" | "ADMIN";
export type ChannelKind = "public" | "announcements";

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  password_hash: string;
  /** GitHub numeric user id as string; set when signed in via OAuth. */
  github_id?: string | null;
  role: UserRole;
  created_at: string;
};

export type UserPublic = Pick<User, "id" | "email" | "username" | "name" | "role">;

export type Channel = {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: ChannelKind;
  archived: boolean;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  kind: "dm";
  dm_key: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  channel_id: string | null;
  conversation_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  author?: UserPublic;
};

export type Notification = {
  id: string;
  user_id: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};
