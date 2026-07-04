import { Skeleton, SkeletonGrid } from "@/components/motion/skeleton";

/** Streamed fallback while a category loads — no spinner, matches the layout. */
export default function Loading() {
  return (
    <div className="rz">
      <Skeleton className="h-[42vw] max-h-[440px] min-h-[320px] rounded-none" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 py-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="pb-16">
          <SkeletonGrid count={6} />
        </div>
      </div>
    </div>
  );
}
