import { CardSkeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="px-8 max-md:px-5 pt-[clamp(3rem,6vw,6rem)] pb-[clamp(2rem,3vw,3rem)]">
      <div className="h-4 w-48 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-4" />
      <div className="h-16 w-3/4 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-5" />
      <div className="h-6 w-1/2 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-12" />

      <div className="h-8 w-48 bg-vibe-border dark:bg-vibe-border-dark animate-pulse rounded-[4px] mb-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
