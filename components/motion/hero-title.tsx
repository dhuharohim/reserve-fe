"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { EASE, gsap } from "./gsap";

interface HeroTitleProps {
  lines: string[];
  className?: string;
}

/** Page-load headline: each line rises out of an overflow mask in sequence. */
export function HeroTitle({ lines, className }: HeroTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-line", {
          yPercent: 115,
          duration: 1.2,
          stagger: 0.14,
          delay: 0.2,
          ease: EASE,
        });
      });
    },
    { scope: ref },
  );

  return (
    <h1 ref={ref} className={className}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span className="hero-line block">{line}</span>
        </span>
      ))}
    </h1>
  );
}
