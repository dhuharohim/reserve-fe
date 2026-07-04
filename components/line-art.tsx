import { cn } from "@/lib/utils";

/**
 * Elegant accent backdrop, drawn as real inline SVG (not a CSS background, so it
 * always renders). `variant="ripples"` — concentric corner ripples, good for
 * cards. `variant="waves"` — full-bleed flowing contour lines, good as a wide
 * section background. Pointer-events off + aria-hidden.
 */
export function LineArt({
  className,
  opacity = 0.55,
  wash = true,
  variant = "ripples",
}: {
  className?: string;
  opacity?: number;
  wash?: boolean;
  variant?: "ripples" | "waves";
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {wash && (
        <div
          className="absolute inset-0"
          style={{
            background:
              variant === "waves"
                ? "linear-gradient(180deg, color-mix(in oklch, var(--accent), transparent 92%) 0%, transparent 60%)"
                : "linear-gradient(150deg, color-mix(in oklch, var(--accent), transparent 88%) 0%, transparent 52%)",
          }}
        />
      )}

      {variant === "waves" ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 520"
          preserveAspectRatio="none"
          fill="none"
          stroke="var(--accent)"
          style={{ opacity }}
        >
          <g strokeWidth={1.2}>
            {[60, 135, 210, 285, 360, 435].map((y, i) => (
              <path
                key={y}
                d={`M-60 ${y} C 220 ${y - 40} 420 ${y + 40} 640 ${y} S 1040 ${y - 40} 1320 ${y}`}
                opacity={0.2 - i * 0.02}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
      ) : (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 480 480"
          preserveAspectRatio="xMaxYMin slice"
          fill="none"
          stroke="var(--accent)"
          style={{ opacity }}
        >
          <g strokeWidth={1.1}>
            <circle cx={470} cy={20} r={70} opacity={0.5} />
            <circle cx={470} cy={20} r={128} opacity={0.4} />
            <circle cx={470} cy={20} r={190} opacity={0.3} />
            <circle cx={470} cy={20} r={258} opacity={0.22} />
            <circle cx={470} cy={20} r={332} opacity={0.15} />
            <circle cx={470} cy={20} r={412} opacity={0.1} />
          </g>
          <g strokeWidth={1}>
            <path d="M-40 300 C 120 250 200 360 480 300" opacity={0.16} />
            <path d="M-40 360 C 120 320 220 420 480 360" opacity={0.1} />
          </g>
        </svg>
      )}
    </div>
  );
}
