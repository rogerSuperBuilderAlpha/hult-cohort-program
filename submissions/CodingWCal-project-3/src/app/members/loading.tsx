export default function MembersLoading() {
  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <div className="h-4 w-20 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-1" />
      <div className="h-8 w-48 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-8" />

      <div className="space-y-6">
        <div className="h-4 w-24 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[4px] border border-vibe-border dark:border-vibe-border-dark p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-vibe-border dark:bg-vibe-border-dark animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px]" />
                  <div className="h-3 w-32 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
