"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Cinematic image plate: scales down from 1.18 as it enters, then drifts
 * on a scrubbed parallax. Framed by a self-drawing gold hairline.
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
}: ParallaxImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const rule = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(inner.current, {
          scale: 1.18,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: frame.current, start: "top 90%", once: true },
        });

        gsap.fromTo(
          inner.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: frame.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.from(rule.current, {
          scaleX: 0,
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: { trigger: frame.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`relative ${className}`}>
      <div
        ref={rule}
        className="gold-foil absolute -top-px left-0 z-10 h-[2px] w-full origin-left"
      />
      <div className="absolute inset-0 overflow-hidden border border-ink">
        <div ref={inner} className="absolute inset-[-10%]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
