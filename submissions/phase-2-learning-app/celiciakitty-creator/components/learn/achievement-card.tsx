import {
  BookOpen,
  ClipboardCheck,
  Scale,
  Shield,
  Star,
  type LucideIcon,
} from "lucide-react";

import type { AchievementDefinition } from "@/lib/achievements/types";
import { isAchievementUnlocked, type AchievementsState } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const iconMap: Record<AchievementDefinition["icon"], LucideIcon> = {
  book: BookOpen,
  clipboard: ClipboardCheck,
  scale: Scale,
  shield: Shield,
  star: Star,
};

type AchievementCardProps = {
  achievement: AchievementDefinition;
  achievements: AchievementsState;
  className?: string;
};

export function AchievementCard({
  achievement,
  achievements,
  className,
}: AchievementCardProps) {
  const unlocked = isAchievementUnlocked(achievements, achievement.id);
  const Icon = iconMap[achievement.icon];

  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 transition-shadow",
        unlocked
          ? "border-lex-gold/30 bg-gradient-to-br from-[#fdf8eb] to-white shadow-sm"
          : "border-lex-navy/10 bg-white opacity-75",
        className
      )}
      aria-label={`${achievement.title}${unlocked ? " — unlocked" : " — locked"}`}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1",
          unlocked
            ? "bg-lex-gold/15 text-lex-gold ring-lex-gold/30"
            : "bg-lex-pale text-lex-navy/40 ring-lex-navy/10"
        )}
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-lex-navy">{achievement.title}</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
              unlocked
                ? "bg-emerald-50 text-emerald-800"
                : "bg-lex-pale text-lex-navy/50"
            )}
          >
            {unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <p className="mt-1 text-sm text-lex-navy/65">{achievement.description}</p>
      </div>
    </article>
  );
}
