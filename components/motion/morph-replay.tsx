"use client";

import { useEffect } from "react";
import { replayMorph } from "@/lib/morph";

/**
 * Drop onto a destination page (e.g. next to the hero). On mount it replays the
 * GSAP Flip morph from the captured source thumbnail — but only where the native
 * View Transitions API is absent (otherwise VT already handled it). Renders
 * nothing.
 */
export function MorphReplay({ id }: { id: string }) {
  useEffect(() => {
    replayMorph(id);
  }, [id]);
  return null;
}
