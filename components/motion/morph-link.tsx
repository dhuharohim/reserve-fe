"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { captureMorph } from "@/lib/morph";

/**
 * A Link that records the shared-element geometry (GSAP Flip fallback) just
 * before navigating. Use from Server Components where an inline onClick can't be
 * passed. Where the native View Transitions API exists, capture is a no-op and
 * VT drives the morph instead.
 */
export function MorphLink({
  morphId,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { morphId: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        captureMorph(morphId);
        onClick?.(e);
      }}
    />
  );
}
