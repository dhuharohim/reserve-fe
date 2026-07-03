import Image from "next/image";
import Link from "next/link";
import { HeroTitle } from "@/components/motion/hero-title";
import { HowItWorks } from "@/components/motion/how-it-works";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Marquee } from "@/components/marquee";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getReservationTypes } from "@/lib/api";
import { typeImage } from "@/lib/images";

// Availability changes constantly — always render with fresh data.
export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80";

export default async function HomePage() {
  const types = await getReservationTypes();

  return (
    <SmoothScroll>
      <section className="grid-paper border-b border-ink">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-12 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between sm:col-span-7">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-widest text-accent">
                The reservation operating system
              </p>
              <HeroTitle
                lines={["Reservations,", "run like", "clockwork."]}
                className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-8xl"
              />
            </div>

            <div className="mt-10">
              <p className="mb-8 max-w-md text-lg leading-relaxed text-muted">
                Clinics, salons, hotels, tables, and stages on one calendar.
                Hold a seat for fifteen minutes, pay when you&apos;re sure —
                no seat is ever sold twice.
              </p>
              <a
                href="#calendar"
                className="inline-block bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne"
              >
                Open the calendar ↓
              </a>
            </div>
          </div>

          <div className="sm:col-span-5">
            <ParallaxImage
              src={HERO_IMAGE}
              alt="Marble hotel terrace at dusk"
              className="h-[50vh] sm:h-[70vh]"
              priority
              sizes="(max-width: 640px) 100vw, 40vw"
            />
            <dl className="mt-5 flex justify-between gap-6 font-mono text-sm">
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">
                  Experiences
                </dt>
                <dd className="gold-foil-text font-display text-2xl font-semibold">
                  {types.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">
                  Seat hold
                </dt>
                <dd className="gold-foil-text font-display text-2xl font-semibold">
                  15&prime;
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">
                  Overbooking
                </dt>
                <dd className="gold-foil-text font-display text-2xl font-semibold">
                  0
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <Marquee
        items={types
          .map((type) => type.name)
          .concat(["No seat sold twice", "All times UTC"])}
      />

      <section id="calendar" className="scroll-mt-8 border-b border-ink">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="mb-6 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted">
              <span>The schedule — every experience</span>
              <span>All times UTC</span>
            </div>
          </Reveal>
          <ScheduleCalendar />
        </div>
      </section>

      <HowItWorks />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section id="experiences" className="scroll-mt-8 py-24">
          <Reveal>
            <div className="mb-8 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted">
              <span>Experiences</span>
              <span>Configuration, not code</span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
            {types.map((type, index) => (
              <Reveal
                key={type.id}
                className={index % 2 === 0 ? "sm:col-span-7" : "sm:col-span-5"}
                delay={(index % 2) * 0.12}
              >
                <Link
                  href={`/reservations/${type.slug}`}
                  className="group block border border-ink bg-surface transition-colors hover:border-accent"
                >
                  <div className="relative h-64 overflow-hidden border-b border-ink sm:h-80">
                    <div
                      aria-hidden="true"
                      className="absolute left-0 top-0 z-10 h-full w-1"
                      style={{ background: type.color ?? "#a8873c" }}
                    />
                    <Image
                      src={typeImage(type)}
                      alt={type.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 55vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-6">
                    <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
                      {type.reservation_mode}
                    </p>
                    <h3 className="mb-2 font-display text-3xl font-semibold tracking-tight">
                      {type.name}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted">
                      {type.description}
                    </p>
                    <span className="font-medium text-accent">
                      View schedule →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
}
