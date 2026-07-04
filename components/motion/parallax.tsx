"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";

/**
 * Scroll-scrubbed parallax (GPU transform only). Wrap an absolutely-positioned
 * layer; give the child image a slight scale so edges never reveal. Disabled
 * under reduced-motion.
 */
export function Parallax({
  children,
  className,
  distance = 12,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { yPercent: -distance },
          {
            yPercent: distance,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
