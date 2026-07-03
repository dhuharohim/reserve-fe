interface MarqueeProps {
  items: string[];
}

/** Infinite ticker strip. Pure CSS loop, paused for reduced motion. */
export function Marquee({ items }: MarqueeProps) {
  const line = items.join("  —  ");

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-champagne"
    >
      <div className="marquee-track flex w-max gap-16 whitespace-nowrap font-mono text-sm uppercase tracking-widest">
        <span>{line}</span>
        <span>{line}</span>
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
