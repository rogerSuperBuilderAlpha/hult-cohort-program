export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  streak: number;
  last_completed_date: string | null; // YYYY-MM-DD
  total_completed: number;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  archived: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null; // YYYY-MM-DD
  created_by: string;
  created_at: string;
  completed_at: string | null;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
