export default function AdminLoading() {
  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <div className="flex items-center justify-between pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
        <div className="h-8 w-24 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px]" />
        <div className="h-9 w-28 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px]" />
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-vibe-border/50 dark:bg-vibe-border-dark/50 animate-pulse rounded-[4px]" />
        ))}
      </div>
    </div>
  );
}
