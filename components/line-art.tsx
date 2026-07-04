import { cn } from "@/lib/utils";

/**
 * Elegant accent backdrop for light content cards: a soft warm wash plus a
 * concentric "ripple" line-art in the corner, drawn in the accent colour.
 * Real inline SVG (not a CSS background) so it always renders; pointer-events
 * off and aria-hidden so it never interferes with the content that sits above.
 */
export function LineArt({
  className,
  opacity = 0.55,
  wash = true,
}: {
  className?: string;
  opacity?: number;
  wash?: boolean;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {wash && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in oklch, var(--accent), transparent 88%) 0%, transparent 52%)",
          }}
        />
      )}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 480 480"
        preserveAspectRatio="xMaxYMin slice"
        fill="none"
        stroke="var(--accent)"
        style={{ opacity }}
      >
        {/* concentric ripples from the top-right corner */}
        <g strokeWidth={1.1}>
          <circle cx={470} cy={20} r={70} opacity={0.5} />
          <circle cx={470} cy={20} r={128} opacity={0.4} />
          <circle cx={470} cy={20} r={190} opacity={0.3} />
          <circle cx={470} cy={20} r={258} opacity={0.22} />
          <circle cx={470} cy={20} r={332} opacity={0.15} />
          <circle cx={470} cy={20} r={412} opacity={0.1} />
        </g>
        {/* a couple of sweeping strokes for movement */}
        <g strokeWidth={1}>
          <path d="M-40 300 C 120 250 200 360 480 300" opacity={0.16} />
          <path d="M-40 360 C 120 320 220 420 480 360" opacity={0.1} />
        </g>
      </svg>
    </div>
  );
}
