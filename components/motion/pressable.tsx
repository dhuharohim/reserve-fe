"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Tactile wrapper — hover lift + press scale, GPU transforms only.
 * Use around CTAs and cards. Renders a span so it can wrap links/buttons.
 */
export function Pressable({
  children,
  className,
  lift = -2,
  ...props
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
} & Omit<ComponentProps<typeof motion.span>, "children">) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex" }}
      whileHover={{ y: lift }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: DURATION.fast, ease: EASE.out }}
      {...props}
    >
      {children}
    </motion.span>
  );
}
