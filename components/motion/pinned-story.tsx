"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";

export interface StoryBeat {
  image: string;
  icon: string;
  num: string;
  title: string;
  body: string;
}

/**
 * Scroll-storytelling that reveals the steps ONE AT A TIME. The section is tall;
 * an inner panel sticks to the viewport and cross-fades each beat as you scroll.
 * Uses `position: sticky` (not GSAP pin/fixed) so it survives the page-transition
 * transform. Reduced-motion falls back to a plain stack.
 */
export function PinnedStory({ beats, className }: { beats: StoryBeat[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Smooth the raw scroll progress so crossfades + parallax read buttery.
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 30, mass: 0.35 });

  if (reduce) {
    return (
      <div className={cn("flex w-full flex-col", className)}>
        {beats.map((beat, i) => (
          <StaticBeat key={i} beat={beat} index={i} />
        ))}
      </div>
    );
  }

  return (
    <section
      ref={ref}
      style={{ height: `${beats.length * 100}vh` }}
      className={cn("relative w-full bg-ink", className)}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {beats.map((beat, i) => (
          <Beat key={i} beat={beat} index={i} total={beats.length} progress={progress} />
        ))}

        {/* progress bar */}
        <motion.div
          style={{ scaleX: progress }}
          className="absolute bottom-0 left-0 z-10 h-[3px] w-full origin-left bg-white/70"
        />
      </div>
    </section>
  );
}

function Beat({
  beat,
  index,
  total,
  progress,
}: {
  beat: StoryBeat;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / total;
  const a = index * seg;
  const b = (index + 1) * seg;
  // Overlap: beat i fades OUT over the same range beat i+1 fades IN — a true
  // crossfade, so there's never a black seam between steps.
  const cross = seg * 0.34;

  const stops =
    total === 1
      ? [0, 1]
      : index === 0
        ? [b - cross, b + cross]
        : index === total - 1
          ? [a - cross, a + cross]
          : [a - cross, a + cross, b - cross, b + cross];
  const values =
    total === 1
      ? [1, 1]
      : index === 0
        ? [1, 0]
        : index === total - 1
          ? [0, 1]
          : [0, 1, 1, 0];

  const opacity = useTransform(progress, stops, values);
  // Continuous slow drift across the whole beat window — reads as depth, no jump.
  const imageY = useTransform(progress, [a - cross, b + cross], ["-7%", "7%"]);
  const contentY = useTransform(progress, [a - cross, b + cross], [26, -26]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 will-change-[opacity]">
      <motion.div style={{ y: imageY }} className="absolute inset-0 scale-[1.28]">
        <Image src={beat.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" />

      <motion.div
        style={{ y: contentY }}
        className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 sm:px-8"
      >
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/25 bg-white/15 text-white backdrop-blur">
          <Ms name={beat.icon} style={{ fontSize: 24 }} />
        </span>
        <span className="rz-mono mb-2 text-[11px] uppercase tracking-[0.22em] text-white/75">
          {beat.num} — of {String(total).padStart(2, "0")}
        </span>
        <h3 className="rz-serif max-w-xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
          {beat.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-base">
          {beat.body}
        </p>
      </motion.div>
    </motion.div>
  );
}

function StaticBeat({ beat, index }: { beat: StoryBeat; index: number }) {
  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      <Image src={beat.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-12 sm:px-8">
        <span className="rz-mono mb-2 text-[11px] uppercase tracking-[0.22em] text-white/75">{beat.num}</span>
        <h3 className="rz-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">{beat.title}</h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85">{beat.body}</p>
      </div>
    </div>
  );
}
