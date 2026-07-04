import type { CSSProperties } from "react";

/** Material Symbols Rounded icon (loaded via the stylesheet link in layout). */
export function Ms({
  name,
  fill = false,
  className = "",
  style,
}: {
  name: string;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`ms ${fill ? "ms-fill" : ""} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}

/** Inline style setting the per-category accent (deep/tint derive in .rz). */
export function accentVars(color: string | null | undefined): CSSProperties {
  return { "--accent": color ?? "#a8873c" } as CSSProperties;
}

/** Material Symbol for a reservation mode. */
export const MODE_ICON: Record<string, string> = {
  appointment: "event_available",
  hotel: "king_bed",
  table: "restaurant",
  event: "confirmation_number",
  rental: "chair",
  queue: "schedule",
};

export function modeIcon(mode: string | undefined): string {
  return (mode && MODE_ICON[mode]) ?? "event";
}
