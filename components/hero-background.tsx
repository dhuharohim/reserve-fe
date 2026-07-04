"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Pinned-hero background: a full-cover image that slowly zooms and dims as you
 * scroll, so the content wiping up over it reads with depth. Scale/opacity only
 * (GPU) — and it always covers, so there's never an edge gap.
 */
export function HeroBackground({ src }: { src: string }) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 900], [1, 1.14]);
  const dim = useTransform(scrollY, [0, 600], [0, 0.5]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/70" />
      <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black" />
    </div>
  );
}
