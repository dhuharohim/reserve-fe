import type { Metadata } from "next";
import { Guides } from "@/components/home/guides";

export const metadata: Metadata = {
  title: "Guides & Stories",
  description: "Short reads from our concierge — where to go, when to book, and how to arrive.",
};

export default function GuidesPage() {
  return (
    <div className="rz">
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-14 sm:px-6">
        <div className="rz-mono mb-3 text-[10.5px] uppercase tracking-[0.2em] text-accent-deep">
          Guides &amp; stories
        </div>
        <h1 className="rz-serif max-w-2xl text-5xl font-semibold leading-none sm:text-6xl">
          The art of reserving well
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          Short reads from our concierge — on where to go, when to book, and how to arrive like a
          regular.
        </p>
      </section>

      <Guides hideHeading />
    </div>
  );
}
