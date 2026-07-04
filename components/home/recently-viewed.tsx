"use client";

import { useEffect, useState } from "react";
import { getRecent } from "@/lib/recent";
import { CollectionRow } from "./collection-row";
import type { ExperienceItem } from "./experience-card";

/** A personalized rail — only appears once the guest has viewed something. */
export function RecentlyViewed() {
  const [items, setItems] = useState<ExperienceItem[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getRecent());
  }, []);

  if (items.length === 0) return null;

  return (
    <CollectionRow
      eyebrow="Pick up where you left off"
      title="Recently viewed"
      subtitle="The experiences you've been eyeing — one tap from reserved."
      types={items}
    />
  );
}
