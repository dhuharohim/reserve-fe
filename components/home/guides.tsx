import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Ms } from "@/components/icon";
import { LineArt } from "@/components/line-art";
import guidesData from "@/data/guides.json";

export interface Guide {
  slug: string;
  kicker: string;
  title: string;
  blurb: string;
  minutes: number;
  author: string;
  date: string;
  image: string;
  excerpt: string;
  body: string[];
}

export const GUIDES = guidesData as Guide[];

export function Guides({ hideHeading = false }: { hideHeading?: boolean }) {
  return (
    <section className={hideHeading ? "pb-16 pt-6" : "py-14"}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {!hideHeading && (
          <Reveal className="mb-6">
            <div className="rz-mono mb-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-deep">
              Guides &amp; stories
            </div>
            <h2 className="rz-serif text-3xl font-semibold sm:text-[2rem]">The art of reserving well</h2>
            <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-muted">
              Short reads from our concierge — on where to go, when to book, and how to arrive.
            </p>
          </Reveal>
        )}

        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {GUIDES.map((guide) => (
            <StaggerItem key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--r)] border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_30px_56px_-34px_rgba(30,20,10,0.5)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={guide.image}
                    alt=""
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
                  />
                </div>
                <div className="relative flex flex-1 flex-col p-5">
                  <LineArt opacity={0.5} />
                  <div className="relative rz-mono mb-2 text-[9.5px] uppercase tracking-[0.18em] text-accent-deep">
                    {guide.kicker}
                  </div>
                  <h3 className="relative rz-serif text-xl font-semibold leading-tight">{guide.title}</h3>
                  <p className="relative mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted">{guide.blurb}</p>
                  <div className="relative mt-4 flex items-center justify-between">
                    <span className="rz-mono text-[11px] text-muted">{guide.minutes} min read</span>
                    <span className="flex items-center gap-1 text-[13px] font-medium text-accent-deep">
                      Read
                      <Ms name="arrow_forward" style={{ fontSize: 15 }} />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
