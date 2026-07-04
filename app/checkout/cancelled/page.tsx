import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelledPage() {
  return (
    <section className="grid-paper relative overflow-hidden border-b border-ink">
      <span className="page-glow page-glow--left" aria-hidden="true" />
      <div className="rf-fade-up relative mx-auto max-w-3xl px-4 py-28 sm:px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
          Checkout cancelled
        </p>
        <h1 className="mb-6 font-display text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          No payment
          <br />
          <em className="gold-foil-text">taken.</em>
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted">
          Your seat stays held for the rest of the fifteen-minute window, then
          goes back on the board. Book again any time from the calendar.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-block bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne"
          >
            Back to the calendar →
          </Link>
          <Link
            href="/upcoming"
            className="inline-block border border-ink px-8 py-4 font-semibold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent"
          >
            My reservations
          </Link>
        </div>
      </div>
    </section>
  );
}
