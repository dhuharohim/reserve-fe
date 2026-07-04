"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "./gsap";

/**
 * Orchestrated hero entrance (GSAP timeline + SplitText). Mark inner nodes
 * with data-hero-eyebrow / data-hero-heading / data-hero-sub / data-hero-panel.
 * Under reduced-motion everything is shown instantly.
 */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("[data-hero-eyebrow],[data-hero-heading],[data-hero-sub],[data-hero-panel]"), { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = root.querySelector<HTMLElement>("[data-hero-heading]");
        const split = heading
          ? new SplitText(heading, { type: "lines,words", linesClass: "overflow-hidden" })
          : null;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-hero-eyebrow]", { y: 18, opacity: 0, duration: 0.55 })
          .from(
            split ? split.words : "[data-hero-heading]",
            { yPercent: 118, opacity: 0, stagger: 0.045, duration: 0.9 },
            "-=0.25",
          )
          .from("[data-hero-sub]", { y: 16, opacity: 0, duration: 0.55 }, "-=0.5")
          .from("[data-hero-panel]", { y: 26, opacity: 0, duration: 0.7 }, "-=0.35");

        return () => split?.revert();
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
