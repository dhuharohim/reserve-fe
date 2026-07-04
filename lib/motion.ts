import type { Variants } from "motion/react";

/**
 * Motion tokens — the single source of truth for timing + easing.
 * Durations are seconds (framer/gsap). Mirror the CSS vars in globals.css.
 */
export const DURATION = {
  fast: 0.12,
  normal: 0.25,
  medium: 0.45,
  page: 0.65,
  hero: 0.9,
} as const;

/** Shared easing curves (cubic-bezier arrays for framer + gsap strings). */
export const EASE = {
  out: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  gsapOut: "power3.out",
  gsapInOut: "power2.inOut",
} as const;

/* ---- reusable framer variants ---- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 38 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE.out },
  },
};

export function staggerContainer(stagger = 0.06, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE.out },
  },
};

/** Tactile press + hover-lift for buttons / cards. */
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { duration: DURATION.fast, ease: EASE.out },
} as const;

/** Gentle horizontal shake for validation errors. */
export const shake: Variants = {
  idle: { x: 0 },
  error: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.4, ease: EASE.inOut },
  },
};

/** Booking step slide (direction-aware). */
export function stepSlide(dir: 1 | -1): Variants {
  return {
    enter: { opacity: 0, x: dir * 28 },
    center: { opacity: 1, x: 0, transition: { duration: DURATION.medium, ease: EASE.out } },
    exit: { opacity: 0, x: dir * -28, transition: { duration: DURATION.normal, ease: EASE.out } },
  };
}
