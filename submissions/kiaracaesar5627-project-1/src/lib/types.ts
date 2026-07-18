// Legacy status kept only for the base migration; FlexiFlow uses custom statuses.
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type WorkspaceRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "GUEST";

export type CustomFieldType = "text" | "number" | "date" | "select" | "checkbox";

export type Theme = "light" | "dark";

export type WorkspaceFeatures = {
  kanban: boolean;
  table: boolean;
  calendar: boolean;
  labels: boolean;
  customFields: boolean;
  comments: boolean;
  activity: boolean;
  automations: boolean;
  notifications: boolean;
  files: boolean;
  integrations: boolean;
  ai: boolean;
  gantt: boolean;
};

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type UserPublic = Pick<User, "id" | "email" | "username" | "name">;

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  accent_color: string;
  features: WorkspaceFeatures;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  user?: UserPublic;
};

export type Status = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  position: number;
  is_done: boolean;
  created_at: string;
};

export type Label = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type CustomField = {
  id: string;
  workspace_id: string;
  name: string;
  type: CustomFieldType;
  options: string[];
  position: number;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  owner_id: string;
  workspace_id: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus | null;
  status_id: string | null;
  position: number;
  due_date: string | null;
  project_id: string;
  assignee_id: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user?: UserPublic;
};

export type Activity = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string | null;
  verb: string;
  detail: string;
  created_at: string;
  user?: UserPublic;
};

export type Notification = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};

export type AutomationRule = {
  id: string;
  workspace_id: string;
  name: string;
  trigger_status_id: string | null;
  action: string;
  enabled: boolean;
  created_at: string;
};

export type UserPrefs = {
  user_id: string;
  theme: Theme;
  accent_color: string;
  updated_at: string;
};
