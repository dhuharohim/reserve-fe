"use client";

import { useEffect } from "react";
import { recordRecent } from "@/lib/recent";
import type { ExperienceItem } from "./experience-card";

/** Records the current experience into recently-viewed. Renders nothing. */
export function RecordView({ item }: { item: ExperienceItem }) {
  useEffect(() => {
    recordRecent(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return null;
}
