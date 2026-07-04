import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getReservationType } from "@/lib/api";
import { accentVars, Ms } from "@/components/icon";
import { Reveal } from "@/components/motion/reveal";
import { Pressable } from "@/components/motion/pressable";
import { GalleryTrigger } from "@/components/gallery";
import { RecordView } from "@/components/home/record-view";
import { ViewTransition } from "@/lib/vt";
import { MorphReplay } from "@/components/motion/morph-replay";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = await getReservationType(slug);
  return { title: type.name, description: type.about ?? type.description ?? undefined };
}

function mapSrc(location: { lat: number; lng: number } | null): string | null {
  if (!location) return null;
  const dLat = 0.006;
  const dLng = 0.011;
  const bbox = `${location.lng - dLng},${location.lat - dLat},${location.lng + dLng},${location.lat + dLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.lat},${location.lng}`;
}

export default async function ReservationTypePage({ params }: PageProps) {
  const { slug } = await params;
  const type = await getReservationType(slug);
  const map = mapSrc(type.location);

  return (
    <div className="rz" style={accentVars(type.color)}>
      <RecordView
        item={{
          id: type.id,
          slug: type.slug,
          name: type.name,
          subtitle: type.subtitle,
          hero_image_url: type.hero_image_url,
          rating: type.rating,
          reviews_count: type.reviews_count,
          price_caption: type.price_caption,
          price_display: type.price_display,
          category: type.category ? { label: type.category.label, icon: type.category.icon } : null,
        }}
      />
      {/* hero */}
      <section className="relative -mt-[68px] h-[44vw] max-h-[480px] min-h-[340px] overflow-hidden">
        <MorphReplay id={`venue-${slug}`} />
        {type.hero_image_url && (
          <ViewTransition name={`venue-${slug}`} share="morph">
            <Image
              src={type.hero_image_url}
              alt={type.name}
              fill
              priority
              sizes="100vw"
              data-flip-id={`venue-${slug}`}
              className="object-cover"
            />
          </ViewTransition>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />
        <GalleryTrigger
          images={[type.hero_image_url, ...type.gallery]}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/28 bg-white/15 px-3 py-1.5 text-[12.5px] text-white backdrop-blur transition-colors hover:bg-white/25"
        />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-4 pb-8 pt-6 sm:px-6">
          <Link
            href={type.category ? `/c/${type.category.key}` : "/"}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/28 bg-white/15 px-3 py-1.5 text-[12.5px] text-white backdrop-blur"
          >
            <Ms name="arrow_back" style={{ fontSize: 16 }} />
            {type.category ? `Back to ${type.category.label}` : "Back"}
          </Link>
          <div>
            <div className="mb-3 flex items-center gap-3">
              {type.category && (
                <span className="rz-mono rounded-full border border-white/25 bg-white/18 px-2.5 py-1 text-[9.5px] uppercase tracking-[0.14em] text-white backdrop-blur">
                  {type.category.label}
                </span>
              )}
              <span className="flex items-center gap-1 text-[13px] text-white">
                <Ms name="star" fill style={{ fontSize: 16 }} />
                {type.rating} · {type.reviews_count.toLocaleString()} reviews
              </span>
            </div>
            <ViewTransition name={`title-venue-${slug}`} share="morph-text">
              <h1 className="rz-serif text-4xl font-semibold leading-none text-white sm:text-6xl">
                {type.name}
              </h1>
            </ViewTransition>
            <p className="mt-2 text-[15px] text-white/90">{type.subtitle}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.5fr_0.9fr]">
        {/* left content */}
        <Reveal className="flex min-w-0 flex-col gap-8">
          {(type.about ?? type.description) && (
            <p className="max-w-2xl text-base leading-relaxed text-ink/85">
              {type.about ?? type.description}
            </p>
          )}

          {type.highlights.length > 0 && (
            <Block label="Highlights">
              <div className="flex flex-col gap-3">
                {type.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 text-[14.5px]">
                    <Ms name="check_circle" style={{ fontSize: 20, color: "var(--accent-deep)" }} />
                    {h}
                  </div>
                ))}
              </div>
            </Block>
          )}

          {type.facilities.length > 0 && (
            <Block label="Facilities">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {type.facilities.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2.5 rounded-[var(--r-sm)] border border-line bg-surface px-3.5 py-3"
                  >
                    <Ms name={f.icon} style={{ fontSize: 20, color: "var(--accent-deep)" }} />
                    <span className="text-[13.5px]">{f.label}</span>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {map && (
            <Block label="Location">
              <div className="overflow-hidden rounded-[var(--r)] border border-line">
                <iframe
                  src={map}
                  title="Map"
                  loading="lazy"
                  className="block h-[280px] w-full border-0"
                  style={{ filter: "saturate(0.9)" }}
                />
                {type.location && (
                  <div className="flex items-center gap-2.5 border-t border-line bg-surface px-4 py-3">
                    <Ms name="location_on" style={{ fontSize: 19, color: "var(--accent-deep)" }} />
                    <span className="text-[13.5px]">{type.location.address}</span>
                  </div>
                )}
              </div>
            </Block>
          )}

          <Block label="Reviews">
            {!type.reviews || type.reviews.length === 0 ? (
              <div className="flex items-center gap-2.5 rounded-[var(--r-sm)] border border-dashed border-line bg-surface px-4 py-5 text-[13.5px] text-muted">
                <Ms name="reviews" style={{ fontSize: 20, color: "var(--accent-deep)" }} />
                No reviews yet — be the first to book and share yours.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {type.reviews.map((review, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--r-sm)] border border-line bg-surface p-4"
                  >
                    <div className="mb-2.5 flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
                      >
                        {review.initial}
                      </span>
                      <div className="flex-1">
                        <div className="text-[13.5px] font-semibold">{review.author_name}</div>
                        <div className="text-[11.5px] text-muted">{review.when}</div>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Ms name="star" fill style={{ fontSize: 14 }} />
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-ink/80">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Block>

          {type.terms.length > 0 && (
            <Block label="Good to know">
              <div className="flex flex-col gap-2.5">
                {type.terms.map((t) => (
                  <div key={t} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-muted">
                    <Ms name="info" style={{ fontSize: 18 }} className="flex-none" />
                    {t}
                  </div>
                ))}
              </div>
            </Block>
          )}
        </Reveal>

        {/* reserve rail */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[var(--r)] border border-line bg-surface p-5 shadow-[0_24px_48px_-34px_rgba(60,45,30,0.28)]">
            <div className="rz-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {type.price_caption}
            </div>
            <div className="rz-serif mb-4 text-3xl font-semibold">
              {type.price_display}
            </div>
            {type.info.length > 0 && (
              <div className="mb-5 flex flex-col gap-2.5">
                {type.info.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                      <Ms name={row.icon} style={{ fontSize: 16 }} />
                      {row.label}
                    </span>
                    <span className="text-right text-[13px] font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <Pressable className="block w-full">
              <Link
                href={`/book/${type.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-[var(--r-sm)] py-3.5 text-[15px] font-semibold text-white"
                style={{ background: "var(--accent-deep)" }}
              >
                Reserve now <Ms name="arrow_forward" style={{ fontSize: 18 }} />
              </Link>
            </Pressable>
            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted">
              <Ms name="verified_user" style={{ fontSize: 16 }} />
              {type.allow_cancellation
                ? "Free cancellation before your visit"
                : "Confirmed instantly"}
            </div>
          </div>
        </aside>
      </div>

      <div className="pb-12" />
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="rz-mono mb-3.5 text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </div>
      {children}
    </div>
  );
}
