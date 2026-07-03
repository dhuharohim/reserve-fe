import Link from "next/link";
import type { Slot } from "@/lib/types";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

interface SlotBoardProps {
  slots: Slot[];
  showType?: boolean;
  emptyMessage?: string;
}

/**
 * The departure board: open slots as a calm timetable ledger.
 * Rows fade up once via CSS; hover inverts the row.
 */
export function SlotBoard({
  slots,
  showType = true,
  emptyMessage = "No open slots right now. Check back soon.",
}: SlotBoardProps) {
  if (slots.length === 0) {
    return (
      <p className="border-t border-ink py-10 font-mono text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="border-t border-ink">
      {slots.map((slot, index) => (
        <li
          key={slot.id}
          className="rf-fade-up border-b border-line"
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        >
          <Link
            href={`/book/${slot.id}`}
            className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 gap-y-1 px-2 py-4 transition-colors duration-300 hover:bg-ink hover:text-paper sm:grid-cols-[5.5rem_6.5rem_1fr_7rem_6rem_5rem] sm:gap-x-6"
          >
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {formatTime(slot.starts_at)}
            </span>

            <span className="font-mono text-xs uppercase tracking-widest text-muted group-hover:text-line">
              {formatDate(slot.starts_at)}
            </span>

            {showType && (
              <span className="col-span-2 text-lg font-semibold sm:col-span-1">
                {slot.reservation_type?.name}
                {slot.resource && (
                  <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted group-hover:text-line">
                    {slot.resource.name}
                  </span>
                )}
              </span>
            )}
            {!showType && (
              <span className="col-span-2 text-lg font-semibold sm:col-span-1">
                {slot.resource?.name ?? ""}
              </span>
            )}

            <span className="font-mono text-xs uppercase tracking-widest text-muted group-hover:text-line">
              {slot.remaining_capacity} seat{slot.remaining_capacity === 1 ? "" : "s"} left
            </span>

            <span className="font-mono text-sm tabular-nums text-accent group-hover:text-champagne">
              {Number(slot.price) > 0 ? formatMoney(slot.price) : "—"}
            </span>

            <span className="text-right font-medium text-accent group-hover:text-champagne">
              Book →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
