"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { Ms } from "@/components/icon";

export interface CategoryMeta {
  count: number;
  rating: string | null;
  fromPrice: string | null;
}

/**
 * Category tile that feels alive: image zooms, overlay lightens, icon animates,
 * and the context + "Explore →" slide up on hover.
 */
export function CategoryTile({
  category,
  meta,
  className,
}: {
  category: Category;
  meta: CategoryMeta;
  className?: string;
}) {
  return (
    <Link
      href={`/c/${category.key}`}
      className={`group relative block overflow-hidden rounded-[var(--r)] bg-panel transition-[box-shadow] duration-300 hover:shadow-[0_30px_56px_-30px_rgba(30,20,10,0.6)] ${className ?? ""}`}
    >
      {category.hero_image_url && (
        <Image
          src={category.hero_image_url}
          alt={category.label}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 transition-colors duration-300 group-hover:from-black/70" />

      <div className="relative flex h-full flex-col items-start justify-between p-4 sm:p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/25 bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          {category.icon && <Ms name={category.icon} style={{ fontSize: 20 }} />}
        </span>

        <div className="w-full">
          <div className="rz-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {category.label}
          </div>

          {/* context row */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-white/85">
            <span>
              {meta.count} experience{meta.count === 1 ? "" : "s"}
            </span>
            {meta.rating && (
              <>
                <span className="text-white/40">·</span>
                <span className="inline-flex items-center gap-1">
                  <Ms name="star" fill style={{ fontSize: 13, color: "var(--champagne)" }} />
                  {meta.rating}
                </span>
              </>
            )}
            {meta.fromPrice && (
              <>
                <span className="text-white/40">·</span>
                <span className="rz-mono">from {meta.fromPrice}</span>
              </>
            )}
          </div>

          {/* hover reveal: tagline + explore */}
          <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100">
            <div className="overflow-hidden">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                {category.tagline}
                <Ms name="arrow_forward" style={{ fontSize: 16 }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
