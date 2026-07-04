import type { ReactNode } from "react";
import { Ms } from "@/components/icon";

/** Réserve empty state — used wherever dynamic data can be absent. */
export function Empty({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--r)] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <div
        className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
      >
        <Ms name={icon} style={{ fontSize: 26 }} />
      </div>
      <h3 className="rz-serif mb-1 text-2xl font-semibold">{title}</h3>
      <p className="mx-auto max-w-sm text-[13.5px] leading-relaxed text-muted">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
