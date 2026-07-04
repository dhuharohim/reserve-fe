import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ms } from "@/components/icon";
import { Reveal } from "@/components/motion/reveal";
import { GUIDES } from "@/components/home/guides";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  return {
    title: guide ? `${guide.title} — Guides` : "Guide",
    description: guide?.blurb ?? undefined,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const more = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <div className="rz">
      {/* hero */}
      <section className="relative -mt-[68px] h-[52vw] max-h-[520px] min-h-[360px] overflow-hidden">
        <Image src={guide.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/55" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-4 pb-10 pt-6 sm:px-6">
          <Link
            href="/guides"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/28 bg-white/15 px-3 py-1.5 text-[12.5px] text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <Ms name="arrow_back" style={{ fontSize: 16 }} /> Guides &amp; stories
          </Link>
          <div className="mt-4">
            <div className="rz-mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--champagne)]">
              {guide.kicker}
            </div>
            <h1 className="rz-serif max-w-2xl text-4xl font-semibold leading-[1.02] text-white sm:text-6xl">
              {guide.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-white/85">
              <span>{guide.author}</span>
              <span className="text-white/40">·</span>
              <span>{guide.date}</span>
              <span className="text-white/40">·</span>
              <span className="rz-mono">{guide.minutes} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* article */}
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Reveal>
          <p className="rz-serif mb-8 text-2xl font-medium leading-snug text-ink sm:text-[26px]">
            {guide.excerpt}
          </p>
          <div className="flex flex-col gap-5 text-[16px] leading-[1.75] text-ink/85">
            {guide.body.map((para, i) => (
              <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-[family-name:var(--font-display)] first-letter:text-5xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-accent-deep" : undefined}>
                {para}
              </p>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 flex items-center gap-2 border-t border-line pt-6 text-[13px] text-muted">
          <Ms name="verified" style={{ fontSize: 18, color: "var(--accent-deep)" }} />
          Written by the {guide.author.toLowerCase().includes("concierge") ? "Réserve concierge" : guide.author}
        </div>
      </article>

      {/* more stories */}
      <section className="border-t border-line bg-paper py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rz-mono mb-5 text-[10px] uppercase tracking-[0.2em] text-accent-deep">More stories</div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {more.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--r)] border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_30px_56px_-34px_rgba(30,20,10,0.5)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={g.image} alt="" fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="rz-mono mb-1.5 text-[9.5px] uppercase tracking-[0.18em] text-accent-deep">{g.kicker}</div>
                  <h3 className="rz-serif text-lg font-semibold leading-tight">{g.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
