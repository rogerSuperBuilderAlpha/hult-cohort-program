export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string | null;
  project_id: string;
  assignee_id: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
};

export type UserPublic = Pick<User, "id" | "email" | "username" | "name">;
