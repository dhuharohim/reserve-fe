import { getCategories, getReservationTypes } from "@/lib/api";
import type { Category, ReservationType } from "@/lib/types";
import { SearchPanel } from "@/components/search-panel";
import { Empty } from "@/components/rz-empty";
import { HeroReveal } from "@/components/motion/hero-reveal";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { HeroBackground } from "@/components/hero-background";
import { PinnedStory } from "@/components/motion/pinned-story";
import { CategoryTile, type CategoryMeta } from "@/components/home/category-tile";
import { ExperienceCard } from "@/components/home/experience-card";
import { CollectionRow } from "@/components/home/collection-row";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { Guides } from "@/components/home/guides";

// Availability changes constantly — always render with fresh data.
export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=2000&q=75&auto=format&fit=crop";

const STORY = [
  {
    num: "01",
    icon: "explore",
    title: "Discover what's worth reserving",
    body: "Stays, tables, treatments and stages — curated, and filtered to exactly what you need.",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1800&q=75&auto=format&fit=crop",
  },
  {
    num: "02",
    icon: "event_available",
    title: "Reserve in a few refined taps",
    body: "Every form adapts to the experience. Pick a time, apply member perks, confirm securely.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1800&q=75&auto=format&fit=crop",
  },
  {
    num: "03",
    icon: "verified",
    title: "Arrive like a regular",
    body: "Your reservation, code and perks wait in your profile. Just show up.",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1800&q=75&auto=format&fit=crop",
  },
];

// Bento column/row spans — the asymmetric editorial masonry.
const BENTO = [
  "col-span-2 lg:col-span-3 lg:row-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
];

/** First number in a price string, for cheapest-in-category. */
function priceNum(s: string | null): number {
  const m = s?.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : Number.POSITIVE_INFINITY;
}

function categoryMeta(category: Category, types: ReservationType[]): CategoryMeta {
  const inCat = types.filter((t) => t.category?.key === category.key);
  const ratings = inCat.map((t) => parseFloat(t.rating ?? "")).filter((n) => !Number.isNaN(n));
  const cheapest = [...inCat].sort((a, b) => priceNum(a.price_display) - priceNum(b.price_display))[0];
  return {
    count: category.types_count ?? inCat.length,
    rating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null,
    fromPrice: cheapest?.price_display ?? null,
  };
}

function rateOf(t: ReservationType): number {
  return parseFloat(t.rating ?? "0") || 0;
}

export default async function HomePage() {
  const [categories, types] = await Promise.all([getCategories(), getReservationTypes()]);

  // Curated collections — derived from the catalogue, deliberately overlapping
  // (an experience can belong to more than one collection).
  const byRating = [...types].sort((a, b) => rateOf(b) - rateOf(a));
  const feature = byRating[0];
  const supporting = byRating.slice(1, 5);
  const trending = [...types].sort((a, b) => b.reviews_count - a.reviews_count).slice(0, 8);

  return (
    <div className="rz">
      {/* pin zone — hero pins; "browse experiences" wipes up over it */}
      <div className="relative -mt-[68px]">
        <section className="sticky top-0 flex h-screen flex-col items-center justify-center px-4 pb-12 pt-20 text-center sm:px-6">
          <HeroBackground src={HERO_IMAGE} />

          <HeroReveal className="relative w-full max-w-3xl">
            <div
              data-hero-eyebrow
              className="rz-mono mb-5 text-[10.5px] uppercase tracking-[0.28em] text-white/80"
            >
              Reserve anything · one concierge
            </div>
            <h1
              data-hero-heading
              className="rz-serif mb-4 text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl"
            >
              Book the moments that matter.
            </h1>
            <p
              data-hero-sub
              className="mx-auto mb-9 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base"
            >
              Stays, tables, treatments and tickets — search once, filter to what you need, and
              confirm in a few refined taps.
            </p>

            <div data-hero-panel>
              <SearchPanel types={types} categories={categories} />
            </div>
          </HeroReveal>
        </section>

        {/* browse experiences — wipes up over the pinned hero */}
        <div className="relative z-10 rounded-t-[calc(var(--r)+22px)] bg-paper shadow-[0_-40px_80px_-30px_rgba(15,10,5,0.5)] ring-1 ring-white/30">
          <div className="mx-auto max-w-6xl px-4 pb-2 pt-10 sm:px-6">
            <section className="pb-9">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <div className="rz-mono mb-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-deep">
                    Discover
                  </div>
                  <h2 className="rz-serif text-3xl font-semibold sm:text-[2rem]">
                    What will you reserve?
                  </h2>
                </div>
                <span className="hidden text-[13px] text-muted sm:block">
                  {categories.length} worlds to explore
                </span>
              </div>

              {categories.length === 0 ? (
                <Empty
                  icon="category"
                  title="No categories yet"
                  description="Once an admin publishes reservation categories, they'll appear here to browse."
                />
              ) : (
                <Stagger
                  className="grid auto-rows-[210px] grid-cols-2 gap-3.5 sm:grid-cols-3 lg:auto-rows-[176px] lg:grid-cols-6"
                  stagger={0.06}
                >
                  {categories.map((category, index) => (
                    <StaggerItem key={category.key} className={BENTO[index % BENTO.length]}>
                      <CategoryTile
                        category={category}
                        meta={categoryMeta(category, types)}
                        className="h-full w-full"
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* after the pin — normal flow */}
      <div className="relative z-10 bg-paper">
        {types.length === 0 ? (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Empty
              icon="event_available"
              title="Nothing to feature yet"
              description="New venues and experiences will show up here as they go live."
            />
          </div>
        ) : (
          <>
            {/* editorial feature — one hero pick + supporting */}
            <section className="py-11">
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-6">
                  <div className="rz-mono mb-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-deep">
                    In the spotlight
                  </div>
                  <h2 className="rz-serif text-3xl font-semibold sm:text-[2rem]">
                    Worth clearing your calendar for
                  </h2>
                  <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-muted">
                    The one reservation our concierge would make this week — and four more worth
                    whispering about.
                  </p>
                </Reveal>

                <div className="grid gap-4 lg:grid-cols-2">
                  {feature && <ExperienceCard type={feature} wide className="h-[440px] lg:h-[564px]" />}
                  <div className="grid grid-cols-2 gap-4">
                    {supporting.map((type) => (
                      <ExperienceCard key={type.id} type={type} className="h-[210px] lg:h-[274px]" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* one curated collection — the fast-movers */}
            <CollectionRow
              eyebrow="Moving fast"
              title="What everyone's reserving"
              subtitle="The tables, rooms and treatments filling up across the city right now."
              types={trending}
            />
          </>
        )}

        {/* personalized — only appears for returning guests */}
        <RecentlyViewed />

        {/* guides & stories — editorial content, not a carousel */}
        <Guides />

        {/* how Réserve works — full-width storytelling */}
        <section className="pt-8">
          <div className="mx-auto mb-6 max-w-6xl px-4 sm:px-6">
            <div className="rz-mono mb-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-deep">
              The ritual
            </div>
            <h2 className="rz-serif text-3xl font-semibold sm:text-[2rem]">How Réserve works</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              Three steps — from discovery to arrival.
            </p>
          </div>
          <PinnedStory beats={STORY} />
        </section>
      </div>
    </div>
  );
}
