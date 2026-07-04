import type { ExperienceItem } from "@/components/home/experience-card";

const KEY = "rz_recent_v1";
const MAX = 12;

export function getRecent(): ExperienceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ExperienceItem[]) : [];
  } catch {
    return [];
  }
}

export function recordRecent(item: ExperienceItem): void {
  if (typeof window === "undefined") return;
  try {
    const next = [item, ...getRecent().filter((x) => x.id !== item.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — recently-viewed is a nicety, fail quietly
  }
}
