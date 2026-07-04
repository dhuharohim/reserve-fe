import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Payment received" };

export default function CheckoutSuccessPage() {
  return (
    <section className="grid-paper relative overflow-hidden border-b border-ink">
      <span className="page-glow" aria-hidden="true" />
      <span className="page-glow page-glow--left" aria-hidden="true" />
      <div className="rf-fade-up relative mx-auto max-w-3xl px-4 py-28 sm:px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
          Payment received
        </p>
        <h1 className="mb-6 font-display text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          You&apos;re on
          <br />
          the <em className="gold-foil-text">board.</em>
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted">
          Your payment went through. The booking confirms within a minute — you
          can watch it flip to Confirmed in your ledger.
        </p>
        <Link
          href="/upcoming"
          className="inline-block bg-ink px-8 py-4 font-semibold uppercase tracking-wide text-paper transition-colors hover:text-champagne"
        >
          View my reservations →
        </Link>
      </div>
    </section>
  );
}
