"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-vibe-accent mb-4">
        Error
      </p>
      <h1 className="text-3xl font-bold tracking-tight mb-3">
        Something went wrong
      </h1>
      <p className="text-sm text-vibe-muted max-w-md mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-[4px] bg-vibe-accent text-white text-sm font-semibold hover:bg-vibe-accent-hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
