"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Ms } from "@/components/icon";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface DateRange {
  from: string | null;
  to: string | null;
}

function iso(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

function monthGrid(year: number, month: number) {
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ key: string; day: number } | null> = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push({ key: iso(year, month, d), day: d });
  return cells;
}

/**
 * Token-driven month calendar. Single-date or range selection, keyboard-free
 * pointer UI matched to the rest of the form system.
 */
export function Calendar({
  mode = "single",
  selected,
  range,
  onSelect,
  onRangeChange,
  minDate,
  className,
}: {
  mode?: "single" | "range";
  selected?: string | null;
  range?: DateRange;
  onSelect?: (date: string) => void;
  onRangeChange?: (range: DateRange) => void;
  minDate?: string;
  className?: string;
}) {
  const base = new Date();
  const [view, setView] = useState({
    year: base.getUTCFullYear(),
    month: base.getUTCMonth(),
  });
  const today = new Date().toISOString().slice(0, 10);
  const floor = minDate ?? today;
  const cells = monthGrid(view.year, view.month);
  const label = new Date(Date.UTC(view.year, view.month, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(Date.UTC(v.year, v.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }

  function pick(key: string) {
    if (mode === "single") {
      onSelect?.(key);
      return;
    }
    const r = range ?? { from: null, to: null };
    if (!r.from || (r.from && r.to)) {
      onRangeChange?.({ from: key, to: null });
    } else if (key < r.from) {
      onRangeChange?.({ from: key, to: r.from });
    } else {
      onRangeChange?.({ from: r.from, to: key });
    }
  }

  function state(key: string) {
    if (mode === "single") return { selected: key === selected, inRange: false, edge: false };
    const r = range ?? { from: null, to: null };
    const isEdge = key === r.from || key === r.to;
    const inRange = Boolean(r.from && r.to && key > r.from && key < r.to);
    return { selected: isEdge, inRange, edge: isEdge };
  }

  return (
    <div className={cn("rounded-[var(--r)] border border-line bg-surface p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
          aria-label="Previous month"
        >
          <Ms name="chevron_left" style={{ fontSize: 20 }} />
        </button>
        <span className="rz-serif text-lg font-semibold">{label}</span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
          aria-label="Next month"
        >
          <Ms name="chevron_right" style={{ fontSize: 20 }} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="rz-mono text-center text-[9.5px] uppercase tracking-wide text-muted">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <span key={`b-${i}`} />;
          const disabled = cell.key < floor;
          const s = state(cell.key);
          return (
            <button
              key={cell.key}
              type="button"
              disabled={disabled}
              onClick={() => pick(cell.key)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-[var(--r-sm)] text-[13.5px] tabular-nums transition-colors",
                disabled && "cursor-default text-ink/35",
                !disabled && !s.selected && !s.inRange && "text-ink hover:bg-panel",
                s.inRange && "bg-[var(--accent-tint)] text-[var(--accent-deep)]",
                s.selected && "font-semibold text-white",
              )}
              style={s.selected ? { background: "var(--accent-deep)" } : undefined}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
