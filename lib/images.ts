import type { ReservationType } from "@/lib/types";

/** Warm architectural fallback for types without their own photography. */
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80";

export function typeImage(type: ReservationType | undefined): string {
  return type?.hero_image_url ?? FALLBACK_IMAGE;
}
