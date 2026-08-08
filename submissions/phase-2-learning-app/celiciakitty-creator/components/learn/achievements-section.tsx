"use client";

import { ACHIEVEMENTS } from "@/lib/achievements/types";
import { useAchievements } from "@/hooks/use-achievements";

import { AchievementCard } from "./achievement-card";

export function AchievementsSection() {
  const { achievements } = useAchievements();
  const unlockedCount = achievements.unlocked.length;

  return (
    <section aria-labelledby="achievements-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="achievements-heading"
            className="font-serif text-xl font-semibold text-lex-navy"
          >
            Achievements
          </h2>
          <p className="mt-1 text-sm text-lex-navy/65">
            {unlockedCount} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2" role="list">
        {ACHIEVEMENTS.map((achievement) => (
          <li key={achievement.id}>
            <AchievementCard
              achievement={achievement}
              achievements={achievements}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
