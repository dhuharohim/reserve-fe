import type { ReactNode } from "react";

/**
 * App Router template — re-mounts on every navigation. Page transitions are now
 * handled by the browser's native View Transitions (see the ::view-transition
 * rules in globals.css + the <ViewTransition> shared-element morphs), so this
 * renders children directly.
 *
 * A Framer enter here would be captured by the view transition mid-animation
 * (new page snapshotted at opacity:0 / shifted), making the shared-element
 * morph stutter — and branching on view-transition support caused a
 * server/client hydration mismatch. Passthrough avoids both.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
