"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getReservationTypes, getSlots } from "@/lib/api";
import { formatMoney, formatMonth, formatTime } from "@/lib/format";
import type { ReservationType, Slot } from "@/lib/types";
import { Skeleton } from "@/components/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FALLBACK_COLOR = "#a8873c";

interface ScheduleCalendarProps {
  /** Lock the calendar to one reservation type (detail pages). */
  lockedType?: ReservationType;
}

function monthStart(cursor: Date): Date {
  return new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
}

function addMonths(cursor: Date, count: number): Date {
  return new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + count, 1));
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * The schedule as a Swiss month grid: hairline cells, mono numerals,
 * type-coloured entries. Selecting a day opens its ledger with Book links.
 */
export function ScheduleCalendar({ lockedType }: ScheduleCalendarProps) {
  const [cursor, setCursor] = useState(() => monthStart(new Date()));
  const [types, setTypes] = useState<ReservationType[]>(
    lockedType ? [lockedType] : [],
  );
  const [filter, setFilter] = useState<string | null>(lockedType?.slug ?? null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lockedType) return;
    getReservationTypes().then(setTypes).catch(() => undefined);
  }, [lockedType]);

  const load = useCallback(() => {
    setSlots(null);
    setError(null);

    const from = cursor.toISOString().slice(0, 10);
    const to = `${addMonths(cursor, 1).toISOString().slice(0, 10)} 00:00:00`;

    getSlots({
      from,
      to,
      per_page: 200,
      reservation_type: lockedType?.slug ?? filter ?? undefined,
    })
      .then(setSlots)
      .catch(() => setError("The schedule couldn't load. Try again."));
  }, [cursor, filter, lockedType]);

  useEffect(load, [load]);

  const colorBySlug = useMemo(() => {
    const map: Record<number, string> = {};
    types.forEach((type) => {
      map[type.id] = type.color ?? FALLBACK_COLOR;
    });
    return map;
  }, [types]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    (slots ?? []).forEach((slot) => {
      const key = dayKey(slot.starts_at);
      map.set(key, [...(map.get(key) ?? []), slot]);
    });
    return map;
  }, [slots]);

  const days = useMemo(() => {
    const first = monthStart(cursor);
    const next = addMonths(cursor, 1);
    const count = Math.round((next.getTime() - first.getTime()) / 86_400_000);
    const leading = (first.getUTCDay() + 6) % 7;

    const cells: Array<{ key: string; date: number } | null> = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let d = 1; d <= count; d++) {
      const date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d));
      cells.push({ key: date.toISOString().slice(0, 10), date: d });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const selectedSlots = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  function slotColor(slot: Slot): string {
    return (
      slot.reservation_type?.color ??
      colorBySlug[slot.reservation_type_id ?? -1] ??
      FALLBACK_COLOR
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <h3 className="font-display text-3xl font-semibold tracking-tight">
            {formatMonth(cursor)}
          </h3>
          <div className="flex gap-1 font-mono">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => {
                setCursor((c) => addMonths(c, -1));
                setSelectedDay(null);
              }}
              className="cursor-pointer border border-line px-2.5 py-1 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => {
                setCursor((c) => addMonths(c, 1));
                setSelectedDay(null);
              }}
              className="cursor-pointer border border-line px-2.5 py-1 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              →
            </button>
          </div>
        </div>

        {!lockedType && types.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by experience">
            <button
              type="button"
              onClick={() => {
                setFilter(null);
                setSelectedDay(null);
              }}
              aria-pressed={filter === null}
              className={`cursor-pointer border px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors ${
                filter === null
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-accent hover:text-accent"
              }`}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type.slug}
                type="button"
                onClick={() => {
                  setFilter(type.slug);
                  setSelectedDay(null);
                }}
                aria-pressed={filter === type.slug}
                className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors ${
                  filter === type.slug
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-muted hover:border-accent hover:text-accent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2"
                  style={{ background: type.color ?? FALLBACK_COLOR }}
                />
                {type.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mb-4 border-l-2 border-danger pl-4 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="border border-ink bg-surface">
          <div className="grid grid-cols-7 border-b border-ink">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center font-mono text-[11px] uppercase tracking-widest text-muted"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((cell, index) => {
              if (cell === null) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-20 border-b border-r border-line bg-paper/60 sm:min-h-28 [&:nth-child(7n)]:border-r-0"
                  />
                );
              }

              const daySlots = byDay.get(cell.key) ?? [];
              const isToday = cell.key === todayKey;
              const isSelected = cell.key === selectedDay;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={daySlots.length === 0}
                  onClick={() => setSelectedDay(isSelected ? null : cell.key)}
                  aria-label={`${cell.key}, ${daySlots.length} slot${daySlots.length === 1 ? "" : "s"}`}
                  className={`min-h-20 border-b border-r border-line p-1.5 text-left align-top transition-colors sm:min-h-28 sm:p-2 [&:nth-child(7n)]:border-r-0 ${
                    isSelected
                      ? "bg-ink text-paper"
                      : daySlots.length > 0
                        ? "cursor-pointer hover:bg-paper"
                        : "cursor-default"
                  }`}
                >
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      isToday
                        ? "border-b-2 border-accent font-semibold"
                        : daySlots.length === 0
                          ? "text-muted/60"
                          : ""
                    }`}
                  >
                    {cell.date}
                  </span>

                  {slots === null ? (
                    <Skeleton className="mt-2 h-3 w-3/4" />
                  ) : (
                    <span className="mt-1.5 block space-y-1">
                      {daySlots.slice(0, 3).map((slot) => (
                        <span key={slot.id} className="flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="h-3 w-[3px] shrink-0"
                            style={{ background: slotColor(slot) }}
                          />
                          <span className="truncate font-mono text-[11px] tabular-nums">
                            {formatTime(slot.starts_at)}
                            <span
                              className={`ml-1 hidden font-sans normal-case xl:inline ${
                                isSelected ? "text-line" : "text-muted"
                              }`}
                            >
                              {lockedType
                                ? (slot.resource?.name ?? "")
                                : (slot.reservation_type?.name ?? "")}
                            </span>
                          </span>
                        </span>
                      ))}
                      {daySlots.length > 3 && (
                        <span
                          className={`block font-mono text-[10px] uppercase tracking-widest ${
                            isSelected ? "text-champagne" : "text-accent"
                          }`}
                        >
                          +{daySlots.length - 3} more
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="relative border border-ink bg-surface">
            <div className="gold-foil absolute left-0 top-0 h-[2px] w-full" />
            <h4 className="border-b border-line px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted">
              {selectedDay ?? "Pick a day"}
            </h4>

            {!selectedDay && (
              <p className="px-4 py-8 text-sm text-muted">
                Choose a day on the calendar to see its open slots.
              </p>
            )}

            {selectedDay && selectedSlots.length === 0 && (
              <p className="px-4 py-8 text-sm text-muted">
                Nothing open on this day.
              </p>
            )}

            {selectedDay && (
              <ol>
                {selectedSlots.map((slot) => (
                  <li key={slot.id} className="border-b border-line last:border-b-0">
                    <Link
                      href={`/book/${slot.id}`}
                      className="group flex items-baseline gap-3 px-4 py-3 transition-colors hover:bg-ink hover:text-paper"
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-[3px] shrink-0 self-center"
                        style={{ background: slotColor(slot) }}
                      />
                      <span className="font-mono text-lg font-semibold tabular-nums">
                        {formatTime(slot.starts_at)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {lockedType
                            ? (slot.resource?.name ?? lockedType.name)
                            : (slot.reservation_type?.name ?? "")}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-widest text-muted group-hover:text-line">
                          {slot.remaining_capacity} left
                          {Number(slot.price) > 0 && ` — ${formatMoney(slot.price)}`}
                        </span>
                      </span>
                      <span className="font-medium text-accent group-hover:text-champagne">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
