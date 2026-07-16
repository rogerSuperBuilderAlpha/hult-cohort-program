export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  totalCompleted: number;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUid: string | null;
  assigneeName: string | null;
  dueDate: string | null; // YYYY-MM-DD
  createdBy: string;
  createdAt: number;
  completedAt: number | null;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
