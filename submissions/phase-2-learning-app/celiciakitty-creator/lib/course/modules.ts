import type { LawCategory, ModuleId, ModuleMeta } from "@/lib/course/types";

export const COURSE_TITLE = "Beginner UK Law";
export const COURSE_SUBTITLE =
  "Civil, criminal and everyday topics explained in plain language";

export const SUBJECT_CATEGORIES: LawCategory[] = [
  "Civil Law",
  "Criminal Law",
  "Everyday Law",
];

export const MODULE_ORDER: ModuleId[] = ["1", "2", "3", "4", "5"];

export const moduleRegistry: ModuleMeta[] = [
  {
    id: "1",
    title: "Contracts in Everyday Life",
    description:
      "How everyday agreements work and what makes them legally binding in civil law",
    category: "Civil Law",
    hasContent: true,
  },
  {
    id: "2",
    title: "Negligence and Duty of Care",
    description:
      "When people owe a duty of care to others and what negligence means in civil law",
    category: "Civil Law",
    hasContent: true,
  },
  {
    id: "3",
    title: "Crime: Acts, Intent and Responsibility",
    description:
      "How criminal liability is generally understood — acts, intent and responsibility",
    category: "Criminal Law",
    hasContent: true,
  },
  {
    id: "4",
    title: "Assault, Self-Defence and Weapons",
    description:
      "Force, self-defence and weapons offences explained for beginners",
    category: "Criminal Law",
    hasContent: true,
  },
  {
    id: "5",
    title: "Your Everyday Legal Rights",
    description:
      "Practical legal rights and responsibilities in daily life across common situations",
    category: "Everyday Law",
    hasContent: true,
  },
];

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return moduleRegistry.find((module) => module.id === id);
}

export function isValidModuleId(id: string): id is ModuleId {
  return MODULE_ORDER.includes(id as ModuleId);
}

export function getNextModuleId(id: ModuleId): ModuleId | null {
  const index = MODULE_ORDER.indexOf(id);
  if (index < 0 || index >= MODULE_ORDER.length - 1) return null;
  return MODULE_ORDER[index + 1] ?? null;
}

export function getPreviousModuleId(id: ModuleId): ModuleId | null {
  const index = MODULE_ORDER.indexOf(id);
  if (index <= 0) return null;
  return MODULE_ORDER[index - 1] ?? null;
}

export function getModulesByCategory(category: LawCategory): ModuleMeta[] {
  return moduleRegistry.filter((module) => module.category === category);
}
