import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Payment received" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-muted">
        Payment received
      </p>
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        You&apos;re on the board.
      </h1>
      <p className="mb-10 max-w-xl text-lg leading-relaxed text-ink-muted">
        Your payment went through. The booking confirms within a minute — you
        can watch it flip to Confirmed in your ledger.
      </p>
      <Link
        href="/bookings"
        className="inline-block bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper hover:bg-accent"
      >
        View my bookings →
      </Link>
    </div>
  );
}
