export default function ProgressBar({
  progress,
  color = '#fff',
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%`, background: color }} />
    </div>
  );
}
