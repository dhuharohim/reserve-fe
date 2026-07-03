import { SkeletonRows } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SkeletonRows rows={6} />
    </div>
  );
}
