"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Lenis smooth scrolling driven by the GSAP ticker, kept in sync with
 * ScrollTrigger. Mounted on the landing page only; workspace pages stay
 * native. Skipped entirely for reduced-motion users.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.09 });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href*="#"]',
      );
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;

      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -16 });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
