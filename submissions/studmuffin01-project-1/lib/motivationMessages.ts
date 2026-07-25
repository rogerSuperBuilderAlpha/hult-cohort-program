import type { FlatTask } from "@/lib/sidebarStats";

export const MOTIVATION_EMOJIS = ["🎉", "👏", "💪", "⭐", "🚀", "😊", "🙌", "✨", "💯", "🔥"] as const;

export type MotivationEmoji = (typeof MOTIVATION_EMOJIS)[number];

const ENCOURAGEMENT_TEMPLATES = [
  "Keep going on {taskName} — you've got this!",
  "One step at a time on {taskName}. Your team believes in you!",
  "Stay focused on {taskName}. Small progress adds up!",
  "You're making a difference on {taskName}. Keep pushing!",
  "Your team is rooting for you on {taskName}. Finish strong!",
] as const;

const CONGRATULATORY_TEMPLATES = [
  "Congratulations on completing {taskName}! Great work!",
  "Well done finishing {taskName} — your team appreciates it!",
  "You crushed {taskName}! Celebrate this win!",
  "Amazing job on {taskName}. On to the next challenge!",
  "Task complete: {taskName}. Thank you for delivering!",
] as const;

export function getTaskDisplayName(task: FlatTask): string {
  return task.description.trim() || `Task ${task.taskNumber}`;
}

export function isTaskComplete(task: FlatTask): boolean {
  return task.status.trim() === "Done";
}

export function getMotivationMessageType(
  task: FlatTask
): "Motivational" | "Congratulatory" {
  return isTaskComplete(task) ? "Congratulatory" : "Motivational";
}

export function getMotivationalMessages(task: FlatTask): string[] {
  const taskName = getTaskDisplayName(task);
  const templates = isTaskComplete(task) ? CONGRATULATORY_TEMPLATES : ENCOURAGEMENT_TEMPLATES;

  return templates.map((template) => template.replace("{taskName}", taskName));
}

/** Insert text at a cursor/selection position within a string. */
export function insertTextAtPosition(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
): { nextValue: string; cursor: number } {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
  return {
    nextValue,
    cursor: start + insertion.length,
  };
}
