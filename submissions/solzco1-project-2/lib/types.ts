export type ProfileRole = "member" | "admin";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: ProfileRole;
  created_at: string;
};

export type Channel = {
  id: string;
  name: string;
  slug: string | null;
  is_dm: boolean;
  archived: boolean;
  created_by: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  user_id: string | null;
  body: string;
  parent_id: string | null;
  is_system: boolean;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "email"> | null;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: "mention" | "dm";
  message_id: string | null;
  channel_id: string | null;
  read_at: string | null;
  created_at: string;
};
