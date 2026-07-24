import { SkeletonBlock } from "@/components/EmptyState";

export default function AppLoading() {
  return (
    <div data-testid="app-loading" className="mx-auto max-w-3xl space-y-4 p-2">
      <SkeletonBlock className="h-8 w-40" />
      <SkeletonBlock className="h-4 w-72" />
      <SkeletonBlock className="h-40 w-full" />
      <SkeletonBlock className="h-24 w-full" />
    </div>
  );
}
