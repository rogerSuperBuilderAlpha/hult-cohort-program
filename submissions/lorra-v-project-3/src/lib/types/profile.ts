export type UserRole = "participant" | "admin";
export type ProfileStatus = "incomplete" | "published" | "unpublished";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  biography: string | null;
  location: string | null;
  skills: string[];
  interests: string[];
  social_links: Record<string, string>;
  website_url: string | null;
  github_profile_url: string | null;
  profile_status: ProfileStatus;
  visible_to_partners: boolean;
  created_at: string;
  updated_at: string;
};
