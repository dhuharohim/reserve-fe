import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-muted">
        Checkout cancelled
      </p>
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        No payment taken.
      </h1>
      <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-muted">
        Your seat stays held for the rest of the fifteen-minute window, then
        goes back on the board. Book again any time from the schedule.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/#calendar"
          className="inline-block bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper hover:bg-accent"
        >
          Back to the schedule →
        </Link>
        <Link
          href="/bookings"
          className="inline-block border-2 border-ink px-8 py-4 font-semibold uppercase tracking-wide hover:bg-ink hover:text-paper"
        >
          My bookings
        </Link>
      </div>
    </div>
  );
}
