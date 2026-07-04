/** Native View Transitions — progressive enhancement for page + shared-element morphs. */

import type { CSSProperties } from "react";

export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Run a DOM update inside a view transition when supported, else run it plain.
 * Never throws — degrades to an instant update.
 */
export function startViewTransition(update: () => void | Promise<void>): void {
  if (prefersReducedMotion() || !supportsViewTransitions()) {
    update();
    return;
  }
  document.startViewTransition(update);
}

/** Shared morph name for experience-card → venue-detail hero transitions. */
export const HERO_VT_NAME = "venue-hero";

/** Shared morph name for category-tile → category-page hero transitions. */
export const CATEGORY_VT_NAME = "category-hero";

/** Name a shared element (e.g. the detail hero) so it morphs from its source. */
export function vtName(name: string): CSSProperties {
  return { viewTransitionName: name } as CSSProperties;
}
