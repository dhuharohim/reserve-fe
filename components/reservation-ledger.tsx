"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  isActiveStatus,
  isCancellable,
  type Reservation,
} from "@/lib/types";
import {
  formatDate,
  formatMoney,
  formatTime,
  statusLabels,
} from "@/lib/format";
import { EmptyState, SkeletonRows } from "@/components/ui";
import { cancelReservation, getReservations } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface ReservationLedgerProps {
  mode: "upcoming" | "history";
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}

/** Shared ledger for the Upcoming and History views. */
export function ReservationLedger({
  mode,
  title,
  emptyTitle,
  emptyDescription,
}: ReservationLedgerProps) {
  const { user, loading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;

    getReservations()
      .then((all) =>
        setReservations(
          all.filter((reservation) =>
            mode === "upcoming"
              ? isActiveStatus(reservation.status)
              : !isActiveStatus(reservation.status),
          ),
        ),
      )
      .catch(() => setPageError("Your reservations couldn't load. Try again."));
  }, [user, mode]);

  useEffect(load, [load]);

  async function handleCancel(reservation: Reservation) {
    const confirmed = window.confirm(
      "Cancel this reservation? The seats go back on the board immediately.",
    );
    if (!confirmed) return;

    setCancelling(reservation.uuid);
    setPageError(null);

    try {
      await cancelReservation(reservation.uuid);
      load();
    } catch (error: unknown) {
      setPageError(
        error instanceof ApiError
          ? error.message
          : "The reservation couldn't be cancelled. Try again.",
      );
    } finally {
      setCancelling(null);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SkeletonRows rows={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight">
          Sign in to see your reservations.
        </h1>
        <Link
          href={`/login?next=/${mode}`}
          className="inline-block bg-ink px-6 py-3 font-semibold text-paper transition-colors hover:text-champagne"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="rf-fade-up mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight">
        {title}
      </h1>

      {pageError && (
        <p className="mb-6 border-l-2 border-accent pl-4 text-sm" role="alert">
          {pageError}
        </p>
      )}

      {reservations === null && !pageError && <SkeletonRows rows={4} />}

      {reservations !== null && reservations.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Link
              href="/#calendar"
              className="inline-block bg-ink px-6 py-3 font-semibold text-paper transition-colors hover:text-champagne"
            >
              Open the calendar →
            </Link>
          }
        />
      )}

      {reservations !== null && reservations.length > 0 && (
        <ol className="border-t border-ink">
          {reservations.map((reservation) => {
            const item = reservation.items?.[0];

            return (
              <li
                key={reservation.uuid}
                className="grid grid-cols-2 items-baseline gap-x-6 gap-y-2 border-b border-line px-2 py-5 sm:grid-cols-[6rem_6.5rem_1fr_9rem_6rem_auto]"
              >
                <span className="font-mono text-xl font-semibold tabular-nums">
                  {item?.starts_at ? formatTime(item.starts_at) : "—"}
                </span>

                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {item?.starts_at ? formatDate(item.starts_at) : "—"}
                </span>

                <span className="col-span-2 sm:col-span-1">
                  <span className="block text-lg font-semibold">
                    {item?.description ?? reservation.reservation_type?.name}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    {reservation.reservation_number}
                    {item && item.quantity > 1 ? ` — ${item.quantity} seats` : ""}
                  </span>
                </span>

                <span
                  className={`font-mono text-xs uppercase tracking-widest ${
                    reservation.status === "confirmed" ||
                    reservation.status === "completed"
                      ? "text-accent"
                      : "text-muted"
                  }`}
                >
                  {statusLabels[reservation.status] ?? reservation.status}
                </span>

                <span className="font-mono text-sm tabular-nums text-accent">
                  {Number(reservation.grand_total) > 0
                    ? formatMoney(reservation.grand_total)
                    : "—"}
                </span>

                <span className="text-right">
                  {mode === "upcoming" && isCancellable(reservation.status) && (
                    <button
                      type="button"
                      disabled={cancelling === reservation.uuid}
                      onClick={() => handleCancel(reservation)}
                      className="cursor-pointer border border-ink px-3 py-1 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-50"
                    >
                      {cancelling === reservation.uuid ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
