import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`animate-pulse bg-line/60 ${className}`} />
  );
}

/** Ledger-row skeleton for boards and tables. */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-t border-ink" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-6 border-b border-line px-2 py-5"
        >
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-line bg-surface px-6 py-14 text-center">
      <div aria-hidden="true" className="mx-auto mb-5 h-10 w-10 border border-line">
        <div className="m-[7px] h-[24px] w-[24px] border border-accent" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}
