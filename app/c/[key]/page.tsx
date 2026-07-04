import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getCategory } from "@/lib/api";
import { accentVars, Ms } from "@/components/icon";
import { Empty } from "@/components/rz-empty";
import { cn } from "@/lib/utils";
import {
  CutoutCard,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  cutoutCardSurfaceClassName,
} from "@/components/ui/cutout-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Pressable } from "@/components/motion/pressable";
import { ViewTransition } from "@/lib/vt";
import { MorphLink } from "@/components/motion/morph-link";
import { MorphReplay } from "@/components/motion/morph-replay";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { key } = await params;
  const category = await getCategory(key);
  return { title: category.label, description: category.blurb ?? undefined };
}

export default async function CategoryPage({ params }: PageProps) {
  const { key } = await params;
  const [category, categories] = await Promise.all([
    getCategory(key),
    getCategories(),
  ]);

  const types = category.types ?? [];
  const avgRating =
    types.length > 0
      ? (
          types.reduce((sum, t) => sum + Number(t.rating ?? 0), 0) /
          types.length
        ).toFixed(1)
      : "—";

  return (
    <div className="rz" style={accentVars(category.color)}>
      {/* hero band */}
      <section className="relative -mt-[68px] h-[42vw] max-h-[440px] min-h-[320px] overflow-hidden">
        <MorphReplay id={`category-${category.key}`} />
        {category.hero_image_url && (
          <ViewTransition name={`category-${category.key}`} share="morph">
            <Image
              src={category.hero_image_url}
              alt={category.label}
              fill
              priority
              sizes="100vw"
              data-flip-id={`category-${category.key}`}
              className="object-cover"
            />
          </ViewTransition>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-9 sm:px-6">
          <Link
            href="/"
            className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/28 bg-white/15 px-3 py-1.5 text-[12.5px] text-white backdrop-blur"
          >
            <Ms name="arrow_back" style={{ fontSize: 16 }} /> All categories
          </Link>
          <span className="rz-mono mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/28 bg-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
            {category.icon && <Ms name={category.icon} style={{ fontSize: 16 }} />}
            {category.label}
          </span>
          <h1 className="rz-serif max-w-2xl text-4xl font-semibold leading-none text-white sm:text-6xl">
            {category.headline}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">
            {category.blurb}
          </p>
          <div className="mt-4 flex gap-8">
            <Stat value={String(types.length)} label="Venues" />
            <Stat value={avgRating} label="Avg rating" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* category chips */}
        <div className="flex flex-wrap gap-2 py-6">
          {categories.map((c) => {
            const active = c.key === category.key;
            return (
              <Link
                key={c.key}
                href={`/c/${c.key}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors"
                style={
                  active
                    ? {
                        borderColor: c.color ?? "var(--accent)",
                        background: "var(--accent-tint)",
                        color: "var(--accent-deep)",
                        fontWeight: 600,
                      }
                    : undefined
                }
              >
                {c.icon && <Ms name={c.icon} style={{ fontSize: 16 }} />}
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* venue cards */}
        {types.length === 0 ? (
          <div className="pb-16">
            <Empty
              icon="event_busy"
              title={`No ${category.label.toLowerCase()} yet`}
              description="Nothing is bookable in this category right now. Check back soon or browse another category."
              action={
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-4 py-2.5 text-[13.5px] font-semibold text-white"
                  style={{ background: "var(--accent-deep)" }}
                >
                  Browse all
                </Link>
              }
            />
          </div>
        ) : (
          <Stagger
            className="grid grid-cols-1 gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.07}
          >
            {types.map((type) => (
              <StaggerItem key={type.id}>
                <CutoutCard className={cn(cutoutCardSurfaceClassName, "flex flex-col p-3")}>
                  <MorphLink morphId={`venue-${type.slug}`} href={`/reservations/${type.slug}`} className="block">
                    <CutoutCardMedia className="h-64 overflow-hidden rounded-[20px] bg-panel">
                      {type.hero_image_url && (
                        <ViewTransition name={`venue-${type.slug}`} share="morph">
                          <CutoutCardImage
                            src={type.hero_image_url}
                            alt={type.name}
                            data-flip-id={`venue-${type.slug}`}
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                        </ViewTransition>
                      )}
                      <CutoutCardOverlay className="rounded-[20px] from-black/55 via-black/10 to-transparent" />

                      {/* rating — corner tab carved into the top-right */}
                      <CutoutCardPin className="right-0 top-0">
                        <div className="flex items-center gap-1 rounded-bl-[18px] rounded-tr-[20px] bg-card px-3 py-1.5 text-[13px] font-semibold text-ink">
                          <Ms name="star" fill style={{ fontSize: 14, color: "var(--accent-deep)" }} />
                          {type.rating}
                        </div>
                      </CutoutCardPin>

                      {/* name — panel carved into the bottom-left, sharing the card surface */}
                      <CutoutCardInsetLabel className="bottom-0 left-0 max-w-[86%] rounded-bl-[20px] rounded-tr-[20px] bg-card px-4 py-3">
                        <ViewTransition name={`title-venue-${type.slug}`} share="morph-text">
                          <div className="rz-serif truncate text-xl font-semibold leading-tight text-ink">
                            {type.name}
                          </div>
                        </ViewTransition>
                        <div className="truncate text-xs text-muted">{type.subtitle}</div>
                      </CutoutCardInsetLabel>
                    </CutoutCardMedia>
                  </MorphLink>

                  <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                    <span className="rz-mono text-xs text-muted">
                      {type.price_caption} {type.price_display}
                    </span>
                    <Pressable>
                      <Link
                        href={`/book/${type.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-white"
                        style={{ background: "var(--accent-deep)" }}
                      >
                        Reserve <Ms name="arrow_forward" style={{ fontSize: 15 }} />
                      </Link>
                    </Pressable>
                  </div>
                </CutoutCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="rz-serif text-2xl font-semibold leading-none text-white">
        {value}
      </div>
      <div className="rz-mono mt-1 text-[9.5px] uppercase tracking-[0.12em] text-white/85">
        {label}
      </div>
    </div>
  );
}
