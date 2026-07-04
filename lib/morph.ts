import { Flip } from "@/components/motion/gsap";

/**
 * Shared-element morph fallback for browsers WITHOUT the native View Transitions
 * API (e.g. Firefox). Where VT is supported we let it drive the morph (see
 * lib/vt.tsx + the ::view-transition rules); here GSAP Flip records the source
 * thumbnail's geometry on click and glides the destination hero from it.
 *
 * Elements that participate carry `data-flip-id="<id>"` — the same id on the
 * source thumbnail and the destination hero, so Flip re-matches across the
 * route change even though the DOM is replaced. State is held in a module
 * singleton, which survives App Router client navigations (same JS context).
 */
type Pending = { id: string; state: ReturnType<typeof Flip.getState>; ts: number };

let pending: Pending | null = null;

export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function escapeId(id: string): string {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(id);
  return id.replace(/["\\]/g, "\\$&");
}

/** Record the source thumbnail's box just before navigating (fallback only). */
export function captureMorph(id: string): void {
  if (typeof window === "undefined" || supportsViewTransitions() || prefersReducedMotion()) {
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-flip-id="${escapeId(id)}"]`);
  if (!el) {
    pending = null;
    return;
  }
  pending = { id, state: Flip.getState(el, { props: "borderRadius" }), ts: Date.now() };
}

/** On the destination, glide the hero (same data-flip-id) from the captured box. */
export function replayMorph(id: string): void {
  if (supportsViewTransitions() || prefersReducedMotion()) return;
  if (!pending || pending.id !== id || Date.now() - pending.ts > 1500) {
    pending = null;
    return;
  }
  const state = pending.state;
  pending = null;
  // Flip re-finds the element by data-flip-id and animates it FROM `state`.
  Flip.from(state, {
    duration: 0.66,
    ease: "power3.inOut",
    absolute: true,
    props: "borderRadius",
  });
}
