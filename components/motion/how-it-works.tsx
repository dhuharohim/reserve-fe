"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";

const BEATS = [
  {
    number: "01",
    title: "Hold",
    body: "Pick a slot and the seat locks to you for fifteen minutes. Nobody else can take it.",
  },
  {
    number: "02",
    title: "Pay",
    body: "Settle on Stripe's hosted checkout — full amount, deposit, or pay on site. The venue decides.",
  },
  {
    number: "03",
    title: "Confirmed",
    body: "The webhook lands, the ledger flips to confirmed, and the seat is yours in ink.",
  },
];

/**
 * The pinned set piece: the section holds while three beats crossfade and
 * a gold progress rail fills. Reduced-motion users see a static list.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const beats = gsap.utils.toArray<HTMLElement>(".hiw-beat");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.6,
          },
        });

        tl.fromTo(
          ".hiw-rail",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", duration: BEATS.length },
          0,
        );

        beats.forEach((beat, index) => {
          if (index > 0) {
            tl.fromTo(
              beat,
              { autoAlpha: 0, y: 60 },
              { autoAlpha: 1, y: 0, duration: 0.35 },
              index,
            );
          }

          if (index < beats.length - 1) {
            tl.to(beat, { autoAlpha: 0, y: -60, duration: 0.35 }, index + 0.65);
          }
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hiw-beat", { autoAlpha: 1, position: "static", y: 0 });
        gsap.set(".hiw-rail", { scaleY: 1 });
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-label="How it works"
      className="relative border-y-2 border-ink bg-surface"
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 sm:px-6">
        <div className="grid w-full grid-cols-1 gap-10 py-20 sm:grid-cols-12">
          <div className="flex gap-6 sm:col-span-4">
            <div className="relative w-[2px] self-stretch bg-line">
              <div className="hiw-rail gold-foil absolute inset-0 origin-top" />
            </div>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
                How it works
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Three beats,
                <br />
                <em className="text-accent">no seat sold twice.</em>
              </h2>
            </div>
          </div>

          <div className="relative min-h-[16rem] sm:col-span-7 sm:col-start-6">
            {BEATS.map((beat, index) => (
              <div
                key={beat.number}
                className="hiw-beat absolute inset-0"
                style={index > 0 ? { opacity: 0, visibility: "hidden" } : undefined}
              >
                <p className="gold-foil-text mb-4 font-display text-7xl font-semibold sm:text-8xl">
                  {beat.number}
                </p>
                <h3 className="mb-3 text-3xl font-bold tracking-tight">{beat.title}</h3>
                <p className="max-w-md text-lg leading-relaxed text-muted">{beat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
