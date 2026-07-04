"use client";

import { useRef } from "react";
import Link from "next/link";
import { ExperienceCard, type ExperienceItem } from "./experience-card";
import { Ms } from "@/components/icon";

/** A curated, horizontally-scrolling collection of experiences. */
export function CollectionRow({
  eyebrow,
  title,
  subtitle,
  types,
  href,
  dark = false,
  vt = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  types: ExperienceItem[];
  href?: string;
  /** Full-width dark band treatment. */
  dark?: boolean;
  /** Enable the card→detail image morph (only where slugs are unique on the page). */
  vt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.82, behavior: "smooth" });
  }

  if (types.length === 0) return null;

  const arrow = dark
    ? "border-white/25 text-white/70 hover:border-white/50 hover:text-white"
    : "border-line text-muted hover:border-accent hover:text-ink";

  return (
    <section className={dark ? "w-full bg-ink py-12" : "py-9"}>
      <div className="mx-auto mb-5 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <div className={`rz-mono mb-1.5 text-[10px] uppercase tracking-[0.2em] ${dark ? "text-[var(--champagne)]" : "text-accent-deep"}`}>
                {eyebrow}
              </div>
            )}
            <h2 className={`rz-serif text-3xl font-semibold sm:text-[2rem] ${dark ? "text-paper" : "text-ink"}`}>{title}</h2>
            {subtitle && <p className={`mt-1 max-w-lg text-[14px] leading-relaxed ${dark ? "text-paper/65" : "text-muted"}`}>{subtitle}</p>}
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {href && (
              <Link href={href} className={`mr-1 text-[13px] font-medium hover:underline ${dark ? "text-[var(--champagne)]" : "text-accent-deep"}`}>
                View all
              </Link>
            )}
            <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${arrow}`}>
              <Ms name="arrow_back" style={{ fontSize: 18 }} />
            </button>
            <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${arrow}`}>
              <Ms name="arrow_forward" style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {types.map((type) => (
          <div key={type.id} className="w-[76vw] shrink-0 snap-start sm:w-[320px]">
            <ExperienceCard type={type} vtName={vt ? `venue-${type.slug}` : undefined} className="h-[380px]" />
          </div>
        ))}
        <div className="w-1 shrink-0 sm:hidden" aria-hidden />
      </div>
    </section>
  );
}
