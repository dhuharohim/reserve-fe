import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /** Right-aligned meta (a count, a status chip). */
  aside?: ReactNode;
  /** Subtitle or actions rendered under the title. */
  children?: ReactNode;
}

/**
 * Cinematic header band for interior pages: grid-paper ground, an ambient
 * gold bloom, an oversized Fraunces title, and a gold-foil base rule.
 */
export function PageHero({ eyebrow, title, aside, children }: PageHeroProps) {
  return (
    <header className="grid-paper relative overflow-hidden border-b border-ink bg-paper">
      <span className="page-glow" aria-hidden="true" />
      <div className="rf-fade-up relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-6 sm:py-16">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            {title}
          </h1>
          {children}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <span
        className="gold-foil absolute bottom-0 left-0 h-[2px] w-full"
        aria-hidden="true"
      />
    </header>
  );
}
