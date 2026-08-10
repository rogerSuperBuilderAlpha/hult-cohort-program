import { IoFlame } from 'react-icons/io5';

export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="streak-badge">
      <IoFlame size={16} />
      <span>{streak} day streak</span>
    </div>
  );
}
