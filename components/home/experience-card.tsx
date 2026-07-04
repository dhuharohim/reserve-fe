"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Ms } from "@/components/icon";
import { ViewTransition } from "@/lib/vt";
import { captureMorph } from "@/lib/morph";

/** The minimal shape an experience card renders — a ReservationType satisfies it. */
export interface ExperienceItem {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  hero_image_url: string | null;
  rating: string | null;
  reviews_count: number;
  price_caption: string | null;
  price_display: string | null;
  category?: { label: string; icon: string | null } | null;
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/**
 * Rich experience card — category badge, title, rating + reviews, from-price,
 * and hover-revealed Save / Reserve. Elegant 150ms interactions.
 */
export function ExperienceCard({
  type,
  className,
  wide = false,
  vtName,
}: {
  type: ExperienceItem;
  className?: string;
  wide?: boolean;
  /** When set, the image morphs into the destination hero with this name. */
  vtName?: string;
}) {
  const [saved, setSaved] = useState(false);

  const image = type.hero_image_url && (
    <Image
      src={type.hero_image_url}
      alt={type.name}
      fill
      data-flip-id={vtName}
      sizes={wide ? "(max-width:1024px) 100vw, 66vw" : "(max-width:1024px) 80vw, 30vw"}
      className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.06]"
    />
  );

  return (
    <div className={`group relative isolate overflow-hidden rounded-[var(--r)] bg-panel ${className ?? ""}`}>
      <Link
        href={`/reservations/${type.slug}`}
        onClick={vtName ? () => captureMorph(vtName) : undefined}
        className="absolute inset-0 z-10"
        aria-label={type.name}
      />
      {vtName ? (
        <ViewTransition name={vtName} share="morph">
          {image}
        </ViewTransition>
      ) : (
        image
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35 transition-opacity duration-300 group-hover:from-black/70" />

      {/* top row: category badge + save */}
      <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between">
        {type.category && (
          <span className="rz-mono inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[9.5px] uppercase tracking-widest text-white backdrop-blur">
            {type.category.icon && <Ms name={type.category.icon} style={{ fontSize: 12 }} />}
            {type.category.label}
          </span>
        )}
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save"}
          onClick={() => setSaved((s) => !s)}
          className="relative z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
        >
          <Ms name={saved ? "favorite" : "favorite_border"} fill={saved} style={{ fontSize: 17 }} />
        </button>
      </div>

      {/* bottom content */}
      <div className={`absolute inset-x-0 bottom-0 z-10 p-4 ${wide ? "sm:p-6" : ""}`}>
        {vtName ? (
          <ViewTransition name={`title-${vtName}`} share="morph-text">
            <h3 className={`rz-serif font-semibold leading-tight text-white ${wide ? "text-3xl sm:text-4xl" : "text-xl"}`}>
              {type.name}
            </h3>
          </ViewTransition>
        ) : (
          <h3 className={`rz-serif font-semibold leading-tight text-white ${wide ? "text-3xl sm:text-4xl" : "text-xl"}`}>
            {type.name}
          </h3>
        )}
        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-white/80">{type.subtitle}</p>

        <div className="mt-2.5 flex items-center gap-3 text-[12px] text-white/90">
          <span className="inline-flex items-center gap-1">
            <Ms name="star" fill style={{ fontSize: 14, color: "var(--champagne)" }} />
            {type.rating}
            <span className="text-white/55">({formatCount(type.reviews_count)})</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="rz-mono">
            {type.price_caption} {type.price_display}
          </span>
        </div>

        {/* hover reveal: Reserve */}
        <div className="mt-0 max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:mt-3 group-hover:max-h-12 group-hover:opacity-100">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-white"
            style={{ background: "var(--accent-deep)" }}
          >
            Reserve <Ms name="arrow_forward" style={{ fontSize: 15 }} />
          </span>
        </div>
      </div>
    </div>
  );
}
