import { cn } from "@/lib/utils";

/** Shimmer placeholder (GPU-friendly: animates background-position only). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rz-shimmer rounded-[var(--r-sm)]", className)} />;
}

/** Venue/card skeleton, matched to the cutout-card footprint. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[calc(var(--r)+6px)] border border-line bg-surface p-3", className)}>
      <Skeleton className="h-64 rounded-[20px]" />
      <div className="flex items-center justify-between px-1 pt-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
