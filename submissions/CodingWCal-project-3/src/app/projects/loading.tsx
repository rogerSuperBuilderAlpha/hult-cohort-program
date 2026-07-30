import { CardSkeleton } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <div className="h-4 w-24 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-1" />
      <div className="h-8 w-48 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
