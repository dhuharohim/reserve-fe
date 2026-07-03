import type { Metadata } from "next";
import Image from "next/image";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getReservationType } from "@/lib/api";
import { typeImage } from "@/lib/images";

// Availability changes constantly — always render with fresh data.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = await getReservationType(slug);

  return {
    title: type.name,
    description: type.description ?? undefined,
  };
}

export default async function ReservationTypePage({ params }: PageProps) {
  const { slug } = await params;
  const type = await getReservationType(slug);

  return (
    <div>
      <section className="relative border-b border-ink">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 z-10 h-[3px] w-full"
          style={{ background: type.color ?? "#a8873c" }}
        />
        <div className="relative h-[36vh] sm:h-[44vh]">
          <Image
            src={typeImage(type)}
            alt={type.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-4 max-w-xl border border-b-0 border-ink bg-paper px-6 pb-2 pt-5 sm:left-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] sm:px-8 sm:pt-6">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
            {type.reservation_mode} — {type.slug}
          </p>
          <h1 className="pb-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {type.name}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="rf-fade-up grid grid-cols-1 gap-8 py-12 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              {type.description}
            </p>
          </div>

          {type.custom_fields.length > 0 && (
            <div className="sm:col-span-4">
              <div className="relative border-l-2 border-line pl-4">
                <div className="gold-foil absolute -left-[2px] top-0 h-full w-[2px]" />
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
                  Asked at booking
                  {type.form_layout === "wizard" ? " — step by step" : ""}
                </h2>
                <ul className="space-y-1 font-mono text-sm">
                  {type.custom_fields.map((field) => (
                    <li key={field.key}>
                      {field.label}
                      {field.required && <span className="text-accent"> *</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="pb-24">
          <div className="mb-6 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted">
            <span>Schedule</span>
            <span>All times UTC</span>
          </div>
          <ScheduleCalendar lockedType={type} />
        </section>
      </div>
    </div>
  );
}
