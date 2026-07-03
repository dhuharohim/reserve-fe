"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { EASE, gsap } from "./gsap";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

/** Scroll-triggered reveal: rises into place once, cinematic ease. */
export function Reveal({ children, delay = 0, className, y = 40 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          opacity: 0,
          y,
          duration: 1.1,
          delay,
          ease: EASE,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        });
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
