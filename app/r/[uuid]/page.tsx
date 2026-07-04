"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ApiError, getReservation, getSlots, rescheduleReservation, submitReview } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime, statusLabels } from "@/lib/format";
import type { Reservation, Slot } from "@/lib/types";
import { accentVars, Ms, modeIcon } from "@/components/icon";
import { QrCode } from "@/components/qr-code";
import { LineArt } from "@/components/line-art";
import { Skeleton } from "@/components/motion/skeleton";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

const STATUS_TONE: Record<string, string> = {
  confirmed: "accent",
  completed: "accent",
  checked_in: "accent",
  pending_payment: "muted",
  draft: "muted",
  cancelled: "danger",
  expired: "danger",
  no_show: "danger",
  refunded: "danger",
};

export default function ReservationDetailPage({ params }: PageProps) {
  const { uuid } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getReservation(uuid)
      .then(setReservation)
      .catch((e: unknown) =>
        setError(
          e instanceof ApiError && e.status === 404
            ? "Reservation not found."
            : "This reservation couldn't load.",
        ),
      );
  }, [uuid, user]);

  if (authLoading || (user && !reservation && !error)) {
    return (
      <div className="rz mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Skeleton className="h-64 w-full rounded-[var(--r)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rz mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-24 sm:px-6">
        <h1 className="rz-serif mb-6 text-4xl font-semibold">Sign in to view this reservation.</h1>
        <Link href={`/login?next=/r/${uuid}`} className="inline-flex w-fit items-center gap-2 rounded-[var(--r-sm)] px-6 py-3 font-semibold text-white" style={{ background: "var(--accent-deep)" }}>
          Sign in <Ms name="arrow_forward" style={{ fontSize: 18 }} />
        </Link>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="rz mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="rz-serif mb-4 text-4xl font-semibold">{error ?? "Not found."}</h1>
        <Link href="/profile" className="text-sm font-semibold" style={{ color: "var(--accent-deep)" }}>
          Back to my reservations →
        </Link>
      </div>
    );
  }

  const type = reservation.reservation_type;
  const item = reservation.items?.[0];
  const tone = STATUS_TONE[reservation.status] ?? "muted";
  const payment = reservation.payments?.find((p) => p.type !== "refund");
  const money = (v: string) => formatMoney(v);
  const showLine = (v: string) => Number(v) > 0;

  return (
    <div className="rz mx-auto max-w-3xl px-4 py-10 sm:px-6" style={accentVars(type?.color)}>
      <Link href="/profile" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted">
        <Ms name="arrow_back" style={{ fontSize: 18 }} /> My reservations
      </Link>

      {/* ticket */}
      <div className="relative overflow-hidden rounded-[calc(var(--r)+6px)] border border-[var(--panel-border)] bg-surface shadow-[0_40px_80px_-46px_rgba(60,45,30,0.42)]">
        <LineArt opacity={0.4} />
        <div className="relative flex items-center justify-between gap-3 p-6" style={{ background: "var(--accent-tint)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px]" style={{ background: "var(--surface)", color: "var(--accent-deep)" }}>
              <Ms name={modeIcon(type?.reservation_mode)} style={{ fontSize: 24 }} />
            </span>
            <div>
              <div className="rz-serif text-xl font-semibold leading-tight">{type?.name}</div>
              <div className="text-xs" style={{ color: "var(--accent-deep)" }}>
                {item?.description ?? type?.subtitle}
              </div>
            </div>
          </div>
          <span
            className="rz-mono rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider"
            style={{
              background: "var(--surface)",
              color: tone === "danger" ? "var(--danger)" : tone === "accent" ? "var(--accent-deep)" : "var(--muted)",
            }}
          >
            {statusLabels[reservation.status] ?? reservation.status}
          </span>
        </div>

        {/* check-in QR */}
        <div className="border-b border-dashed border-line px-6 py-7 text-center">
          <div className="rz-mono mb-3 text-[10px] uppercase tracking-[0.18em] text-muted">
            Show this at check-in
          </div>
          <QrCode value={reservation.uuid} className="mx-auto w-fit rounded-[var(--r-sm)] bg-white p-3" />
          <div className="rz-mono mt-3 text-[11px] tracking-[0.14em] text-muted">
            {reservation.reservation_number}
          </div>
        </div>

        {/* when + who */}
        <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-4">
          <Detail label="Date" value={item?.starts_at ? formatDate(item.starts_at) : "—"} />
          <Detail label="Time" value={item?.starts_at ? `${formatTime(item.starts_at)} UTC` : "—"} />
          <Detail label="Guest" value={reservation.customer_name} />
          <Detail label="Booked" value={formatDate(reservation.created_at)} />
        </div>

        {/* invoice */}
        <div className="border-t border-line px-6 py-5">
          <div className="rz-mono mb-3.5 text-[10px] uppercase tracking-[0.18em] text-muted">Invoice</div>

          <div className="mb-4 flex flex-col gap-2.5">
            {(reservation.items ?? []).map((line) => (
              <div key={line.id} className="flex items-baseline justify-between gap-4 text-sm">
                <span>
                  {line.description}
                  {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                </span>
                <span className="rz-mono tabular-nums">{money(line.line_total)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-3.5 text-sm">
            <Row label="Subtotal" value={money(reservation.subtotal)} />
            {showLine(reservation.discount_total) && (
              <Row
                label={
                  reservation.voucher_code
                    ? `Discount · ${reservation.voucher_code}`
                    : "Member discount"
                }
                value={`− ${money(reservation.discount_total)}`}
                accent
              />
            )}
            {showLine(reservation.tax_total) && <Row label="Tax" value={money(reservation.tax_total)} />}
            {showLine(reservation.service_charge_total) && (
              <Row label="Service charge" value={money(reservation.service_charge_total)} />
            )}
          </div>

          <div className="mt-3.5 flex items-baseline justify-between border-t border-line pt-3.5">
            <span className="text-sm text-muted">
              {payment?.status === "succeeded" ? "Total paid" : "Total"}
            </span>
            <span className="rz-serif text-3xl font-semibold">{money(reservation.grand_total)}</span>
          </div>

          {payment && (
            <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
              <Ms name={payment.status === "succeeded" ? "verified" : "schedule"} style={{ fontSize: 16 }} />
              {payment.method.replace("_", " ")} ·{" "}
              {payment.status === "succeeded"
                ? `paid ${payment.paid_at ? formatDate(payment.paid_at) : ""}`
                : payment.status}
            </div>
          )}
        </div>
      </div>

      <ReservationActions reservation={reservation} onChanged={setReservation} />
    </div>
  );
}

function ReservationActions({
  reservation,
  onChanged,
}: {
  reservation: Reservation;
  onChanged: (r: Reservation) => void;
}) {
  const type = reservation.reservation_type;
  const canReschedule = Boolean(type?.allow_reschedule) && reservation.status === "confirmed";
  const canReview = reservation.status === "completed";

  const [mode, setMode] = useState<"reschedule" | "review" | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "reschedule" && type?.slug) {
      getSlots({ reservation_type: type.slug }).then(setSlots).catch(() => undefined);
    }
  }, [mode, type?.slug]);

  if (!canReschedule && !canReview) return null;

  async function move(slotId: number) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await rescheduleReservation(reservation.uuid, slotId));
      setMode(null);
      setDone("Your reservation has been moved.");
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : "Couldn't reschedule. Try another time.");
    } finally {
      setBusy(false);
    }
  }

  async function review() {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await submitReview(reservation.uuid, rating, body.trim());
      setMode(null);
      setDone("Thank you — your review has been shared.");
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : "Couldn't submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      {done && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--r)] border border-[var(--panel-border)] bg-surface px-4 py-3 text-sm">
          <Ms name="verified" style={{ fontSize: 18, color: "var(--accent-deep)" }} /> {done}
        </div>
      )}

      {!mode && !done && (
        <div className="flex flex-wrap gap-2.5">
          {canReschedule && (
            <button
              onClick={() => setMode("reschedule")}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--accent)]"
            >
              <Ms name="event" style={{ fontSize: 17 }} /> Reschedule
            </button>
          )}
          {canReview && (
            <button
              onClick={() => setMode("review")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--accent-deep)" }}
            >
              <Ms name="star" style={{ fontSize: 17 }} /> Leave a review
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {mode === "reschedule" && (
        <div className="rounded-[var(--r)] border border-[var(--panel-border)] bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="rz-serif text-lg font-semibold">Pick a new time</span>
            <button onClick={() => setMode(null)} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
          </div>
          {slots.length === 0 ? (
            <p className="text-sm text-muted">No other times available right now.</p>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">
              {slots.map((s) => (
                <button
                  key={s.id}
                  disabled={busy}
                  onClick={() => move(s.id)}
                  className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] border border-line px-3 py-2.5 text-left text-sm transition-colors hover:border-[var(--accent)] disabled:opacity-50"
                >
                  <span className="rz-mono tabular-nums">
                    {formatDate(s.starts_at)} · {formatTime(s.starts_at)}
                  </span>
                  <span className="text-xs text-muted">{s.remaining_capacity} left</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "review" && (
        <div className="rounded-[var(--r)] border border-[var(--panel-border)] bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="rz-serif text-lg font-semibold">How was it?</span>
            <button onClick={() => setMode(null)} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
          </div>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="transition-transform hover:scale-110">
                <Ms name="star" fill={n <= rating} style={{ fontSize: 26, color: n <= rating ? "var(--champagne)" : "var(--line)" }} />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Tell others what made it special…"
            className="w-full rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={review}
            disabled={busy || !body.trim()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--accent-deep)" }}
          >
            {busy ? "Sharing…" : "Share review"}
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="rz-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-0.5 text-[14px] font-medium">{value}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="rz-mono tabular-nums" style={accent ? { color: "var(--accent-deep)" } : undefined}>
        {value}
      </span>
    </div>
  );
}
